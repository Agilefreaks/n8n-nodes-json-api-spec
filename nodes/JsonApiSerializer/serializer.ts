import { NodeOperationError, type INode } from 'n8n-workflow';

export interface JsonApiResource {
	id: string;
	type: string;
	attributes: unknown;
}

export interface ResourceInput {
	resource_type: string;
	resource_id: string;
	attributes: unknown;
}

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

export function buildPayload(
	response_type: 'object' | 'array',
	resources: ResourceInput[]
): { data: JsonApiResource | JsonApiResource[] } {
	if (response_type === 'object') {
		const resource = resources[0];
		const data = serialize(resource.resource_type, resource.resource_id, resource.attributes);
		return { data };
	} else {
		const data = resources.map(resource =>
			serialize(resource.resource_type, resource.resource_id, resource.attributes)
		);
		return { data };
	}
}
