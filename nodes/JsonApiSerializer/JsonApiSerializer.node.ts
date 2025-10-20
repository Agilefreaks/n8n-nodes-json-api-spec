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

		const resources = JsonApiSerializer.buildResources(this, response_type);
		const pagination = JsonApiSerializer.buildPaginationInput(this);
		const payload = buildPayload(response_type, resources, pagination);

		return [this.helpers.returnJsonArray(payload as any)];
	}

	private static buildResources(context: IExecuteFunctions, responseType: 'object' | 'array'): ResourceInput[] {
		if (responseType === 'object') {
			return [JsonApiSerializer.buildSingleResource(context, 0)];
		}

		const items = context.getInputData();
		return items.map((_, i) => JsonApiSerializer.buildSingleResource(context, i));
	}

	private static buildSingleResource(context: IExecuteFunctions, index: number): ResourceInput {
		const resource_type = context.getNodeParameter('resource_type', index) as string;
		const resource_id = context.getNodeParameter('resource_id', index) as string;
		const resource_attributes = context.getNodeParameter('resource_attributes', index) as string;
		const attributes = parseAttributes(context.getNode(), resource_attributes);

		return { resource_type, resource_id, attributes };
	}

	private static buildPaginationInput(context: IExecuteFunctions): PaginationInput | undefined {
		if (!context.getNodeParameter('enable_pagination', 0)) {
			return undefined;
		}

		const url = context.getNodeParameter('pagination_url', 0) as string;
		const currentPage = context.getNodeParameter('pagination_current_page', 0) as number;
		const pageSize = context.getNodeParameter('pagination_page_size', 0) as number;
		const totalPages = context.getNodeParameter('pagination_total_pages', 0) as number;

		const queryParams = {
			...JsonApiSerializer.parseFilterParams(context),
			page: { number: currentPage, size: pageSize }
		};

		return {
			url,
			queryParams,
			totalPages,
			customMeta: JsonApiSerializer.parseCustomMeta(context),
		};
	}

	private static parseFilterParams(context: IExecuteFunctions): Record<string, unknown> {
		const queryParamsString = context.getNodeParameter('pagination_query_params', 0) as string;

		if (!queryParamsString || !queryParamsString.trim()) {
			return {};
		}

		return parseAttributes(context.getNode(), queryParamsString) as Record<string, unknown>;
	}

	private static parseCustomMeta(context: IExecuteFunctions): Record<string, unknown> | undefined {
		const metaInputMode = context.getNodeParameter('pagination_meta_input_mode', 0) as string;

		if (metaInputMode === 'json') {
			return JsonApiSerializer.parseCustomMetaJson(context);
		}
		return JsonApiSerializer.parseCustomMetaFields(context);
	}

	private static parseCustomMetaJson(context: IExecuteFunctions): Record<string, unknown> | undefined {
		const customMetaString = context.getNodeParameter('pagination_custom_meta_json', 0) as string;
		return customMetaString ? parseAttributes(context.getNode(), customMetaString) as Record<string, unknown> : undefined;
	}

	private static parseCustomMetaFields(context: IExecuteFunctions): Record<string, unknown> | undefined {
		const fieldsData = context.getNodeParameter('pagination_custom_meta_fields', 0) as {
			field?: Array<{ name: string; value: string }>;
		};

		if (!fieldsData?.field?.length) {
			return undefined;
		}

		return fieldsData.field.reduce((acc, { name, value }) => {
			if (name) acc[name] = value;
			return acc;
		}, {} as Record<string, unknown>);
	}
}
