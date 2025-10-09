import { type IExecuteFunctions, NodeOperationError, type INode } from 'n8n-workflow';

export interface JsonApiResource {
	id: string;
	type: string;
	attributes: unknown;
}

/**
 * Serializes a single object to JSON API format
 */
export function serialize(
	resource_type: string,
	resource_id: string,
	resource_attributes: unknown
): JsonApiResource {
	return {
		id: resource_id,
		type: resource_type,
		attributes: resource_attributes
	};
}

export function parseAttributes(node: INode, attributes: string): unknown {
	try {
		return JSON.parse(attributes);
	} catch (exception) {
		throw new NodeOperationError(node, 'Attributes must be a valid json');
	}
}

export function serializeFromNode(
	context: IExecuteFunctions,
	itemIndex: number
): JsonApiResource {
	const resource_type = context.getNodeParameter('resource_type', itemIndex) as string;
	const resource_id = context.getNodeParameter('resource_id', itemIndex) as string;
	const resource_attributes = context.getNodeParameter('resource_attributes', itemIndex) as string;

	const attributes = parseAttributes(context.getNode(), resource_attributes);
	return serialize(resource_type, resource_id, attributes);
}
