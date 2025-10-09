/* eslint-disable n8n-nodes-base/node-filename-against-convention */
/* eslint-disable n8n-nodes-base/node-dirname-against-convention */
import {
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
	NodeOperationError
} from 'n8n-workflow';
import { serialize } from './serializer';

export class Serializer implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Json Api Serializer',
		name: 'jsonApiSerializer',
		icon: { light: 'file:logo.png', dark: 'file:logo.png' },
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
				displayName: 'JSON Attributes',
				name: 'json_resource_attributes',
				placeholder: 'Add attributes as json',
				type: 'json',
				default: ''
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const response_type = this.getNodeParameter('response_type', 0);
		const resource_type = this.getNodeParameter('resource_type', 0);
		const resource_id = this.getNodeParameter('resource_id', 0);

		let json_resource_attributes = this.getNodeParameter('json_resource_attributes', 0) as string;
		try {
			json_resource_attributes = JSON.parse(json_resource_attributes);
		} catch (exception) {
			throw new NodeOperationError(this.getNode(), 'Attributes must be a valid json');
		}

		let payload = {}
		let data;

		if (response_type === 'object') {
			data = serialize(resource_type as string, resource_id as string, json_resource_attributes);
			payload = { data: data };
		}
		else if (response_type === 'array') {
			data = serialize(resource_type as string, resource_id as string, json_resource_attributes);
			payload = { data: [data] }
		}
		else {
			throw new NodeOperationError(this.getNode(), 'Invalid response type');
		}

		return [this.helpers.returnJsonArray(payload as any)];
	}
}
