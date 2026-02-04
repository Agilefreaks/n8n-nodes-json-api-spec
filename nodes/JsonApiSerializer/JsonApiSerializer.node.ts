import {
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';
import { JsonApiResponseBuilder } from './JsonApiResponseBuilder';
import { PaginationConfig, Resource, ResponseType } from './Types';
import { parseResource } from './Helpers';

export class JsonApiSerializer implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Json Api Serializer',
		name: 'jsonApiSerializer',
		icon: { light: 'file:logo.svg', dark: 'file:logo.svg' },
		group: ['transform'],
		version: 1,
		description: 'Serialize data to Json Api Specification',
		defaults: {
			name: 'Json Api Serializer',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Response',
				name: 'response_type',
				type: 'options',
				options: [
					{
						name: 'Resource Object',
						value: ResponseType.OBJECT,
					},
					{
						name: 'Resources Array',
						value: ResponseType.ARRAY,
					},
				],
				default: 'object',
				description: 'What type of data to serialize: array or single object',
				required: true,
			},
			{
				displayName: 'Type',
				name: 'resource_type',
				type: 'string',
				default: 'resource',
				description: 'The type of the resource',
				required: true,
			},
			{
				displayName: 'ID',
				name: 'resource_id',
				type: 'string',
				default: '={{ $json.id.toString() }}',
				description: 'The type of the resource',
				required: true,
			},
			{
				displayName: 'Attributes',
				name: 'resource_attributes',
				type: 'json',
				placeholder: 'Add attributes as json',
				default: "={{ $json.removeField('id').toJsonString() }}",
				description: 'The attributes of the resource',
				required: true,
			},
			{
				displayName: 'Enable Include Relationships',
				name: 'enable_include_resources',
				type: 'boolean',
				default: false,
				description: 'Whether to allow configuration for include and relationships added to the response'
			},
			{
				displayName: 'Include Filter',
				name: 'include_filter',
				type: 'string',
				default: "={{ $('Webhook').first().json.query.include }}",
				description: 'Array of relationship names to include in the response. Default value is the include parameter from incoming request. Setting empty will NOT return any includes.',
				displayOptions: {
					show: {
						enable_include_resources: [true],
					},
				},
			},
			{
				displayName: 'Include Resources',
				name: 'included',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				placeholder: 'Add include resource',
				description: 'Add include resource',
				options: [
					{
						displayName: 'Resource',
						name: 'resources',
						values: [
							{
								displayName: 'Type',
								name: 'type',
								type: 'string',
								default: '',
								description: 'Name of the included resource',
								required: true,
							},
							{
								displayName: 'Relationship Name',
								name: 'relationshipName',
								type: 'string',
								default: '',
								description: 'Name for the relationship in the response',
								required: true,
							},
							{
								displayName: 'Attributes',
								name: 'attributes',
								type: 'json',
								default: '',
								description: 'Attributes of the included resource',
								required: true,
							},
						],
					},
				],
				displayOptions: {
					show: {
						enable_include_resources: [true],
					},
				},
			},
			{
				displayName: 'Add Pagination',
				name: 'add_pagination',
				type: 'boolean',
				default: false,
				description: 'Whether to add pagination links and meta to the response',
				displayOptions: {
					show: {
						response_type: [ResponseType.ARRAY],
					},
				},
			},
			{
				displayName: 'Base URL',
				name: 'pagination_base_url',
				type: 'string',
				default: '',
				placeholder: "={{ $('Webhook').first().json.webhookUrl }}",
				description: 'The base URL for pagination links',
				required: true,
				displayOptions: {
					show: {
						response_type: [ResponseType.ARRAY],
						add_pagination: [true],
					},
				},
			},
			{
				displayName: 'Current Page',
				name: 'pagination_page',
				type: 'string',
				default: "={{ $('Parse input').first().json.page }}",
				description: 'The current page number',
				required: true,
				displayOptions: {
					show: {
						response_type: [ResponseType.ARRAY],
						add_pagination: [true],
					},
				},
			},
			{
				displayName: 'Items Per Page',
				name: 'pagination_per_page',
				type: 'string',
				default: "={{ $('Parse input').first().json.per_page }}",
				description: 'Number of items per page',
				required: true,
				displayOptions: {
					show: {
						response_type: [ResponseType.ARRAY],
						add_pagination: [true],
					},
				},
			},
			{
				displayName: 'Total Resource Count',
				name: 'pagination_total_count',
				type: 'number',
				default: 0,
				description: 'Total number of resources across all pages',
				required: true,
				displayOptions: {
					show: {
						response_type: [ResponseType.ARRAY],
						add_pagination: [true],
					},
				},
			},
			{
				displayName: 'Query Params',
				name: 'pagination_query_params',
				type: 'json',
				default: '{}',
				placeholder: "={{ $('Webhook').first().json.query }}",
				description: 'Additional query params to include in pagination links as JSON object',
				displayOptions: {
					show: {
						response_type: [ResponseType.ARRAY],
						add_pagination: [true],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const response_type = this.getNodeParameter('response_type', 0) as ResponseType;
		const raw_included = this.getNodeParameter('included', 0) as any;
		const has_relationships = raw_included.resources?.length > 0;
		const include_filter_raw = this.getNodeParameter('include_filter', 0, '') as string;
		const include_filter: string[] = include_filter_raw
			? include_filter_raw.split(',').map(s => s.trim()).filter(Boolean)
			: [];

		let pagination: PaginationConfig | undefined;
		if (response_type === ResponseType.ARRAY) {
			const addPagination = this.getNodeParameter('add_pagination', 0, false) as boolean;
			if (addPagination) {
				const queryParamsRaw = this.getNodeParameter('pagination_query_params', 0, '{}') as string;
				const queryParams = queryParamsRaw === 'string' ? JSON.parse(queryParamsRaw || '{}') : queryParamsRaw;
				pagination = {
					enabled: true,
					baseUrl: this.getNodeParameter('pagination_base_url', 0) as string,
					page: this.getNodeParameter('pagination_page', 0) as number,
					perPage: this.getNodeParameter('pagination_per_page', 0) as number,
					totalResourceCount: this.getNodeParameter('pagination_total_count', 0) as number,
					queryParams,
				};
			}
		}

		const resources: Resource[] = [];

		if (response_type === ResponseType.OBJECT) {
			const resource = parseResource(this, 0);

			resources.push(resource);
		} else {
			const items = this.getInputData();

			for (let i = 0; i < items.length; i++) {
				const resource = parseResource(this, i);

				resources.push(resource);
			}
		}

		const response = new JsonApiResponseBuilder(
			response_type,
			resources,
			has_relationships,
			include_filter,
			pagination,
		).buildResponse();

		return [this.helpers.returnJsonArray(response as any)];
	}
}
