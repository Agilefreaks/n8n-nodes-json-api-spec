export interface JsonApiResource {
	id: string;
	type: string;
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

