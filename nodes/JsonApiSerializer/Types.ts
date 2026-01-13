export interface Resource {
	id: string;
	type: string;
	attributes: any;
	relationships?: Resource[];
	relationshipName?: string;
}

export interface PaginationConfig {
	enabled: boolean;
	baseUrl: string;
	page: number;
	perPage: number;
	totalResourceCount: number;
}

export interface JsonApiLinks {
	first: string;
	prev: string | null;
	next: string | null;
	last: string;
}

export interface JsonApiMeta {
	page: {
		current: number;
		size: number;
		total: number;
	};
	[key: string]: number | { current: number; size: number; total: number };
}

export interface JsonApiResponse {
	data: JsonApiResource | JsonApiResource[];
	included?: JsonApiResource[];
	links?: JsonApiLinks;
	meta?: JsonApiMeta;
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
