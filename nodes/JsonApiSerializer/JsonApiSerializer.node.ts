import {
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';
import { JsonApiResponseBuilder } from './JsonApiResponseBuilder';
import { Resource } from './Types';
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
			{
				displayName: 'Include Resources',
				name: 'include_resources',
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
						name: 'include_resource',
						values: [
							{
								displayName: 'Include Resource Name',
								name: 'include_resource_name',
								type: 'string',
								default: '',
								description: 'Name of the included resource',
								required: true
							},
							{
								displayName: 'Include Resource Attributes',
								name: 'include_resource_attributes',
								type: 'json',
								default: '',
								description: 'Attributes of the included resource',
								required: true
							},
						],
					},
				],
				}
		]
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const response_type = this.getNodeParameter('response_type', 0) as 'object' | 'array';
		const resources: Resource[] = [];

		if (response_type === 'object') {
			const resource = parseResource(this, 0);

			resources.push(resource);
		} else {
			const items = this.getInputData();

			for (let i = 0; i < items.length; i++) {
				const resource = parseResource(this, i);

				resources.push(resource);
			}
		}

		const response = new JsonApiResponseBuilder(response_type, resources).buildResponse();

		return [this.helpers.returnJsonArray(response as any)];
	}
}
