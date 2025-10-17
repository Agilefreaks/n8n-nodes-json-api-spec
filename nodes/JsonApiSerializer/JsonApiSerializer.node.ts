import {
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription
} from 'n8n-workflow';
import { buildPayload, parseAttributes, type PaginationInput, type ResourceInput } from './serializer';

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
						value: 'object',
					},
					{
						name: 'Resources Array',
						value: 'array',
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
				default: 'resource',
				description: 'The type of the resource',
				required: true,
			},
			{
				displayName: 'Attributes',
				name: 'resource_attributes',
				type: 'json',
				placeholder: 'Add attributes as json',
				default: '',
				description: 'The attributes of the resource',
				required: true
			},
			{
				displayName: 'Enable Pagination',
				name: 'enable_pagination',
				type: 'boolean',
				default: false,
				description: 'Whether pagination information should be included in the response',
			},
			{
				displayName: 'URL',
				name: 'pagination_url',
				type: 'string',
				default: '',
				placeholder: '= e.g. webhookUrl',
				description: 'The endpoint base URL',
				displayOptions: {
					show: {
						enable_pagination: [true],
					},
				},
				required: true,
			},
			{
				displayName: 'Current Page',
				name: 'pagination_current_page',
				type: 'number',
				default: 1,
				description: 'The current page number',
				displayOptions: {
					show: {
						enable_pagination: [true],
					},
				},
				required: true,
			},
			{
				displayName: 'Page Size',
				name: 'pagination_page_size',
				type: 'number',
				default: 10,
				description: 'Number of items per page',
				displayOptions: {
					show: {
						enable_pagination: [true],
					},
				},
				required: true,
			},
			{
				displayName: 'Total Pages',
				name: 'pagination_total_pages',
				type: 'number',
				default: 1,
				description: 'Total number of pages available',
				displayOptions: {
					show: {
						enable_pagination: [true],
					},
				},
				required: true,
			},
			{
				displayName: 'Query Parameters (Filters)',
				name: 'pagination_query_params',
				type: 'json',
				default: '{}',
				placeholder: '{"filter": {"name": "cons", "country": "France"}}',
				description: 'Additional query parameters like filters (pagination params will be added automatically)',
				displayOptions: {
					show: {
						enable_pagination: [true],
					},
				},
			},
			{
				displayName: 'Custom Metadata Input Mode',
				name: 'pagination_meta_input_mode',
				type: 'options',
				options: [
					{
						name: 'JSON',
						value: 'json',
					},
					{
						name: 'Fields',
						value: 'fields',
					},
				],
				default: 'fields',
				description: 'How to define custom metadata: as JSON or individual fields',
				displayOptions: {
					show: {
						enable_pagination: [true],
					},
				},
			},
			{
				displayName: 'Custom Meta (JSON)',
				name: 'pagination_custom_meta_json',
				type: 'json',
				default: '',
				placeholder: '{"total_count": "10000"}',
				description: 'Additional metadata fields to include (as JSON object)',
				displayOptions: {
					show: {
						enable_pagination: [true],
						pagination_meta_input_mode: ['json'],
					},
				},
			},
			{
				displayName: 'Custom Meta Fields',
				name: 'pagination_custom_meta_fields',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				placeholder: 'Add Field',
				description: 'Additional metadata fields to include',
				displayOptions: {
					show: {
						enable_pagination: [true],
						pagination_meta_input_mode: ['fields'],
					},
				},
				options: [
					{
						displayName: 'Field',
						name: 'field',
						values: [
							{
								displayName: 'Field Name',
								name: 'name',
								type: 'string',
								default: '',
								placeholder: 'total_count',
								description: 'Name of the metadata field',
								required: true,
							},
							{
								displayName: 'Field Value',
								name: 'value',
								type: 'string',
								default: '',
								placeholder: '10000',
								description: 'Value of the metadata field',
								required: true,
							},
						],
					},
				],
			}
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const response_type = this.getNodeParameter('response_type', 0) as 'object' | 'array';
		const enable_pagination = this.getNodeParameter('enable_pagination', 0) as boolean;

		const resources: ResourceInput[] = [];

		if (response_type === 'object') {
			const resource_type = this.getNodeParameter('resource_type', 0) as string;
			const resource_id = this.getNodeParameter('resource_id', 0) as string;
			const resource_attributes = this.getNodeParameter('resource_attributes', 0) as string;
			const attributes = parseAttributes(this.getNode(), resource_attributes);

			resources.push({ resource_type, resource_id, attributes });
		} else {
			const items = this.getInputData();
			for (let i = 0; i < items.length; i++) {
				const resource_type = this.getNodeParameter('resource_type', i) as string;
				const resource_id = this.getNodeParameter('resource_id', i) as string;
				const resource_attributes = this.getNodeParameter('resource_attributes', i) as string;
				const attributes = parseAttributes(this.getNode(), resource_attributes);

				resources.push({ resource_type, resource_id, attributes });
			}
		}

		let pagination: PaginationInput | undefined;

		if (enable_pagination) {
			const url = this.getNodeParameter('pagination_url', 0) as string;
			const currentPage = this.getNodeParameter('pagination_current_page', 0) as number;
			const pageSize = this.getNodeParameter('pagination_page_size', 0) as number;
			const totalPages = this.getNodeParameter('pagination_total_pages', 0) as number;
			const queryParamsString = this.getNodeParameter('pagination_query_params', 0) as string;
			const metaInputMode = this.getNodeParameter('pagination_meta_input_mode', 0) as string;

			let filterParams: Record<string, unknown> = {};
			if (queryParamsString && queryParamsString.trim()) {
				filterParams = parseAttributes(this.getNode(), queryParamsString) as Record<string, unknown>;
			}

			const queryParams = {
				...filterParams,
				page: {
					number: currentPage,
					size: pageSize
				}
			};

			let customMeta: Record<string, unknown> | undefined;

			if (metaInputMode === 'json') {
				const customMetaString = this.getNodeParameter('pagination_custom_meta_json', 0) as string;
				if (customMetaString) {
					customMeta = parseAttributes(this.getNode(), customMetaString) as Record<string, unknown>;
				}
			} else {
				const fieldsData = this.getNodeParameter('pagination_custom_meta_fields', 0) as {
					field?: Array<{ name: string; value: string }>;
				};

				if (fieldsData?.field && fieldsData.field.length > 0) {
					customMeta = {};
					for (const fieldItem of fieldsData.field) {
						if (fieldItem.name) {
							customMeta[fieldItem.name] = fieldItem.value;
						}
					}
				}
			}

			pagination = {
				url,
				queryParams,
				totalPages,
				customMeta,
			};
		}

		const payload = buildPayload(response_type, resources, pagination);

		return [this.helpers.returnJsonArray(payload as any)];
	}
}
