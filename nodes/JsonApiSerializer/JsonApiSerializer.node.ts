import {
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription
} from 'n8n-workflow';
import { buildPayload, parseAttributes, type ResourceInput } from './serializer';

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
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const response_type = this.getNodeParameter('response_type', 0) as 'object' | 'array';

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

		const payload = buildPayload(response_type, resources);

		return [this.helpers.returnJsonArray(payload as any)];
	}
}
