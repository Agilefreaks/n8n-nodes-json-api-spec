/* eslint-disable n8n-nodes-base/node-filename-against-convention */
/* eslint-disable n8n-nodes-base/node-dirname-against-convention */
import {
	type IExecuteFunctions,
	type INodeExecutionData,
	type IDataObject,
	type INodeType,
	type INodeTypeDescription
} from 'n8n-workflow';

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
						name: "Object",
						value: "object"
					},
					{
						name: "Array",
						value: "array"
					}
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
				placeholder: 'Add Attributes',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				options: [
					{
						name: 'attribute_values',
						displayName: 'Attribute',
						values: [
							{
								displayName: 'Name',
								name: 'attribute_name',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
							}
						],
					},
				],
			}
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const response_type = this.getNodeParameter('response_type', 0);
		const resource_type = this.getNodeParameter('resource_type', 0);
		const resource_id = this.getNodeParameter('resource_id', 0);
		const resource_attributes = this.getNodeParameter('resource_attributes', 0) as IDataObject;

		const attributes: Record<string, unknown> = {};
		console.log(resource_attributes)
		// Populate attributes from { attribute_values: [{ attribute_name, attribute_value }] }
		const attributeValues = (resource_attributes?.attribute_values as IDataObject[] | undefined) ?? [];
		console.log(attributeValues)
		for (const entry of attributeValues) {
			console.log(entry)
			const attributeName = entry.attribute_name as string | undefined;
			const attributeValue = entry.value as unknown;
			if (attributeName) {
				attributes[attributeName] = attributeValue;
			}
		}


		const data = {
			id: resource_id,
			type: resource_type,
			attributes,
		};

		// If the user selected array, wrap in an array, else return as object
		const payload = response_type === 'array' ? [data] : data;

		return [this.helpers.returnJsonArray(payload as any)];
	}
}
