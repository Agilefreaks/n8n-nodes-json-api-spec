/* eslint-disable n8n-nodes-base/node-filename-against-convention */
/* eslint-disable n8n-nodes-base/node-dirname-against-convention */
import {
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
	NodeOperationError
} from 'n8n-workflow';
import { serializeFromNode } from './serializer';

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
		const response_type = this.getNodeParameter('response_type', 0);

		let payload: { data: unknown };
		let data;

		if (response_type === 'object') {
			data = serializeFromNode(this, 0);
		} else if (response_type === 'array') {
			const items = this.getInputData();
			data = items.map((_, i) => serializeFromNode(this, i));
		} else {
			throw new NodeOperationError(this.getNode(), 'Invalid response type');
		}

		payload = { data };
		return [this.helpers.returnJsonArray(payload as any)];
	}
}
