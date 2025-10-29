export interface ResourceInput {
	resource_type: string;
	resource_id: string;
	attributes: any;
}

export interface Resource {
	id: string;
	type: string;
	attributes: any;
	relationships?: Resource[]
}

export interface JsonApiResponse {
	data: JsonApiResource | JsonApiResource[];
	included?: JsonApiResource[];
}

export interface JsonApiResource {
	id: string;
	type: string;
	attributes: any;
	relationships?: any;
}

export interface JsonApiResourceRelationship {
	id: string;
	type: string;
}

export enum ResponseType {
	OBJECT = 'object',
  ARRAY = 'array'
}
