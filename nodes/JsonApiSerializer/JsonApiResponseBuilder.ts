import { JsonApiLinks, JsonApiMeta, JsonApiResource, JsonApiResponse, PaginationConfig, Relationship, Resource, ResponseType } from './Types';

export class JsonApiResponseBuilder {
	response_type: ResponseType;
	resources: Resource[];
	has_relationships: boolean = false;
	include_filter: string[];
	pagination?: PaginationConfig;

	constructor(response_type: ResponseType, resources: Resource[], has_relationships: boolean = false, include_filter: string[] = [], pagination?: PaginationConfig) {
		this.response_type = response_type;
		this.resources = resources;
		this.has_relationships = has_relationships;
		this.pagination = pagination;
		this.include_filter = include_filter;
	}

	buildResponse(): JsonApiResponse {
		const response: JsonApiResponse = {} as JsonApiResponse;

		if (this.response_type === ResponseType.OBJECT) {
			this.buildObjectResponse(response);
		} else {
			this.buildArrayResponse(response);
		}

		return response;
	}

	private buildArrayResponse(response: JsonApiResponse): void {
		if (this.has_relationships) {
			response.included = [];

			response.data = this.resources.map((resource) => {
				const jsonApiResource = this.createJsonApiResource(resource);
				this.addRelationshipsToResource(resource.relationships, jsonApiResource);
				this.addRelationshipsToIncluded(resource.relationships, response);
				return jsonApiResource;
			});
		} else {
			response.data = this.resources;
		}

		if (this.pagination?.enabled) {
			response.links = this.buildLinks();
			response.meta = this.buildMeta();
		}
	}

	private buildObjectResponse(response: JsonApiResponse): void {
		const resource = this.resources[0];
		const jsonApiResource = this.createJsonApiResource(resource);

		if (this.has_relationships) {
			response.included = [];
			this.addRelationshipsToResource(resource.relationships, jsonApiResource);
			this.addRelationshipsToIncluded(resource.relationships, response);
		}

		response.data = jsonApiResource;
	}

	private createJsonApiResource(resource: Resource): JsonApiResource {
		return { id: resource.id, type: resource.type, attributes: resource.attributes } as JsonApiResource;
	}

	private addRelationshipsToResource(relationships: Relationship[] = [], jsonApiResource: JsonApiResource): void {
		jsonApiResource.relationships = {};

		this.filterRelationshipsByInclude(relationships).forEach(({ name, relationshipType, resources }) => {
			jsonApiResource.relationships[name] = relationshipType === 'one-to-many'
				? { data: resources.map((r) => ({ id: r.id, type: r.type })) }
				: { data: resources[0]?.id ? { id: resources[0].id, type: resources[0].type } : null };
		});
	}

	private filterRelationshipsByInclude(relationships: Relationship[]): Relationship[] {
		if (this.include_filter.length === 0) return [];
		return relationships.filter(({ name }) => this.include_filter.includes(name));
	}

	private addRelationshipsToIncluded(relationships: Relationship[] = [], response: JsonApiResponse): void {
		this.filterRelationshipsByInclude(relationships).forEach(({ resources }) => {
			resources.forEach((resource) => {
				const alreadyAdded = response.included?.some((r) => r.id === resource.id && r.type === resource.type);
				if (resource.id && !alreadyAdded) {
					response.included?.push({ id: resource.id, type: resource.type, attributes: resource.attributes });
				}
			});
		});
	}

	private buildPageUrl(page: number): string {
		const { baseUrl, perPage, queryParams } = this.pagination!;
		const url = new URL(baseUrl);

		if (queryParams) {
			this.flattenQueryParams(queryParams).forEach(([key, value]) => {
				if (key !== 'page' && key !== 'per_page') {
					url.searchParams.set(key, value);
				}
			});
		}

		url.searchParams.set('page', page.toString());
		url.searchParams.set('per_page', perPage.toString());
		return url.toString();
	}

	private flattenQueryParams(obj: Record<string, any>, prefix = ''): [string, string][] {
		return Object.entries(obj).flatMap(([key, value]) => {
			const newKey = prefix ? `${prefix}[${key}]` : key;

			if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
				return this.flattenQueryParams(value, newKey);
			}
			return [[newKey, String(value)] as [string, string]];
		});
	}

	private getTotalPages(): number {
		const { perPage, totalResourceCount } = this.pagination!;
		return Math.ceil(totalResourceCount / perPage);
	}

	private buildLinks(): JsonApiLinks {
		const { page } = this.pagination!;
		const totalPages = this.getTotalPages();

		return {
			first: this.buildPageUrl(1),
			prev: page > 1 ? this.buildPageUrl(page - 1) : null,
			next: page < totalPages ? this.buildPageUrl(page + 1) : null,
			last: this.buildPageUrl(totalPages),
		};
	}

	private buildMeta(): JsonApiMeta {
		const { page, perPage, totalResourceCount } = this.pagination!;
		const totalPages = this.getTotalPages();
		const resourceType = this.resources[0]?.type || 'resource';
		const countKey = `total_${resourceType}_count`;

		return {
			page: {
				current: Math.floor(page),
				size: Math.floor(perPage),
				total: totalPages,
			},
			[countKey]: Math.floor(totalResourceCount),
		};
	}
}
