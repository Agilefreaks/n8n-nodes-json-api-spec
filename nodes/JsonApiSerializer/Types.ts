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

export enum ResponseType {
	OBJECT = 'object',
  ARRAY = 'array'
}
