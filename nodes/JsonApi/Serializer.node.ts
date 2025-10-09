/* eslint-disable n8n-nodes-base/node-filename-against-convention */
/* eslint-disable n8n-nodes-base/node-dirname-against-convention */
import {
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription
} from 'n8n-workflow';
import { buildPayload, parseAttributes, type ResourceInput } from './serializer';

export class Serializer implements INodeType {
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
				displayName: 'Reponse Type',
				name: 'response_type',
				type: 'options',
				options: [
					{
						name: 'Object',
						value: 'object',
					},
					{
						name: 'Array',
						value: 'array',
					},
				],
				default: 'object',
				required: true,
				description: 'What type of data to serialize: array or object',
			},
			{
				displayName: 'Resource Type',
				name: 'resource_type',
				type: 'string',
				default: 'resource',
				required: true,
				description: 'The type of the resource',
			},
			{
				displayName: 'Resource ID',
				name: 'resource_id',
				type: 'string',
				default: 'resource',
				required: true,
				description: 'The type of the resource',
			},
			{
				displayName: 'Attributes',
				name: 'resource_attributes',
				placeholder: 'Add attributes as json',
				type: 'json',
				default: ''
			}
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
