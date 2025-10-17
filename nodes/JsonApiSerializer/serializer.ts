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

export interface PaginationLinks {
	first: string;
	prev: string | null;
	next: string | null;
	last: string;
}

export interface PaginationMeta {
	page: {
		current: number;
		size: number;
		total: number;
	};
	[key: string]: unknown;
}

export interface PaginationInput {
	url: string;
	queryParams: Record<string, unknown>;
	totalPages: number;
	customMeta?: Record<string, unknown>;
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

function flattenQueryParams(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
	const result: Record<string, string> = {};

	for (const [key, value] of Object.entries(obj)) {
		const paramKey = prefix ? `${prefix}[${key}]` : key;

		if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
			Object.assign(result, flattenQueryParams(value as Record<string, unknown>, paramKey));
		} else {
			result[paramKey] = String(value);
		}
	}

	return result;
}

export function buildPaginationLinks(
	url: string,
	queryParams: Record<string, unknown>,
	totalPages: number
): PaginationLinks {
	const pageInfo = (queryParams.page as Record<string, unknown>);
	const currentPage = Number(pageInfo.number);
	const pageSize = Number(pageInfo.size);

	const buildUrl = (pageNumber: number) => {
		const updatedQueryParams = {
			...queryParams,
			page: {
				number: pageNumber,
				size: pageSize
			}
		};

		const flatParams = flattenQueryParams(updatedQueryParams);

		try {
			const urlObj = new URL(url);
			Object.entries(flatParams).forEach(([key, value]) => {
				urlObj.searchParams.set(key, value);
			});
			return urlObj.toString();
		} catch (error) {
			const queryString = Object.entries(flatParams)
				.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
				.join('&');
			const separator = url.includes('?') ? '&' : '?';
			return `${url}${separator}${queryString}`;
		}
	};

	return {
		first: buildUrl(1),
		prev: currentPage > 1 ? buildUrl(currentPage - 1) : null,
		next: currentPage < totalPages ? buildUrl(currentPage + 1) : null,
		last: buildUrl(totalPages)
	};
}

export function buildPaginationMeta(
	queryParams: Record<string, unknown>,
	totalPages: number,
	customMeta?: Record<string, unknown>
): PaginationMeta {
	const pageInfo = (queryParams.page as Record<string, unknown>);
	const currentPage = Number(pageInfo.number);
	const pageSize = Number(pageInfo.size);

	const meta: PaginationMeta = {
		page: {
			current: currentPage,
			size: pageSize,
			total: totalPages
		}
	};

	if (customMeta) {
		Object.assign(meta, customMeta);
	}

	return meta;
}

export function buildPayload(
	response_type: 'object' | 'array',
	resources: ResourceInput[],
	pagination?: PaginationInput
): { data: JsonApiResource | JsonApiResource[]; meta?: PaginationMeta; links?: PaginationLinks } {
	const result: { data: JsonApiResource | JsonApiResource[]; meta?: PaginationMeta; links?: PaginationLinks } = {
		data: response_type === 'object'
			? serialize(resources[0].resource_type, resources[0].resource_id, resources[0].attributes)
			: resources.map(resource =>
					serialize(resource.resource_type, resource.resource_id, resource.attributes)
			  )
	};

	if (pagination) {
		result.meta = buildPaginationMeta(
			pagination.queryParams,
			pagination.totalPages,
			pagination.customMeta
		);
		result.links = buildPaginationLinks(
			pagination.url,
			pagination.queryParams,
			pagination.totalPages
		);
	}

	return result;
}
