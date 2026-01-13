import { JsonApiLinks, JsonApiMeta, JsonApiResource, JsonApiResponse, PaginationConfig, Resource, ResponseType } from './Types';

export class JsonApiResponseBuilder {
	response_type: ResponseType;
	resources: Resource[];
	has_relationships: boolean = false;
	pagination?: PaginationConfig;

	constructor(response_type: ResponseType, resources: Resource[], has_relationships: boolean = false, pagination?: PaginationConfig) {
		this.response_type = response_type;
		this.resources = resources;
		this.has_relationships = has_relationships;
		this.pagination = pagination;
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

	private addRelationshipsToResource(relationships: Resource[] = [], jsonApiResource: JsonApiResource): void {
		jsonApiResource.relationships = {};

		relationships.forEach((relationship: Resource) => {
			const relationshipName = relationship.relationshipName || relationship.type;

			if(relationship.id) {
				jsonApiResource.relationships[relationshipName] = { data: { id: relationship.id, type: relationship.type }};
			}
			else {
				jsonApiResource.relationships[relationshipName] = { data: null };
			}
		});
	}

	private addRelationshipsToIncluded(relationships: Resource[] = [], response: JsonApiResponse): void {
		relationships.forEach((relationship: Resource) => {
			const relationshipAlreadyAdded = response.included?.some((resource) => resource.id === relationship.id && resource.type === relationship.type)
			const relationshipPresent = relationship.id

			if (relationshipPresent && !relationshipAlreadyAdded) {
				response.included?.push(this.toIncludedResource(relationship));
			}
		});
	}

	private toIncludedResource(resource: Resource): JsonApiResource {
		const { relationshipName, relationships, ...includedResource } = resource;
		return includedResource as JsonApiResource;
	}

	private buildPageUrl(page: number): string {
		const { baseUrl, perPage } = this.pagination!;
		const url = new URL(baseUrl);
		url.searchParams.set('page', page.toString());
		url.searchParams.set('per_page', perPage.toString());
		return url.toString();
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
