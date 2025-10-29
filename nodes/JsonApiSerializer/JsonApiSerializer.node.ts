import {
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';
import { JsonApiResponseBuilder } from './JsonApiResponseBuilder';
import { Resource, ResponseType } from './Types';
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
								required: true
							},
							{
								displayName: 'Attributes',
								name: 'attributes',
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
		const response_type = this.getNodeParameter('response_type', 0) as ResponseType;
		const raw_included = this.getNodeParameter('included', 0) as any;
		const has_relationships = raw_included.resources?.length > 0;

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

		const response = new JsonApiResponseBuilder(response_type, resources, has_relationships).buildResponse();

		return [this.helpers.returnJsonArray(response as any)];
	}
}
