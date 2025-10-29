import { JsonApiResource, JsonApiResponse, Resource, ResponseType } from './Types';


export class JsonApiResponseBuilder {
	response_type: ResponseType;
	resources: Resource[];
	has_relationships: boolean = false;

	constructor(response_type: ResponseType, resources: Resource[], has_relationships: boolean = false) {
		this.response_type = response_type;
		this.resources = resources;
		this.has_relationships = has_relationships;
	}

	buildResponse() : JsonApiResponse {
		const response: JsonApiResponse = { } as JsonApiResponse;

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

			response.data = this.resources.map(resource => {
				const jsonApiResource = this.createJsonApiResource(resource);
				this.addRelationshipsToResource(jsonApiResource, resource.relationships, response);
				return jsonApiResource;
			});
		} else {
			response.data = this.resources;
		}
	}

	private buildObjectResponse(response: JsonApiResponse): void {
		const resource = this.resources[0];
		const jsonApiResource = this.createJsonApiResource(resource);

		if (this.has_relationships) {
			response.included = [];
			this.addRelationshipsToResource(jsonApiResource, resource.relationships, response);
		}

		response.data = jsonApiResource;
	}

	private createJsonApiResource(resource: Resource): JsonApiResource {
		return { id: resource.id, type: resource.type, attributes: resource.attributes } as JsonApiResource;
	}

	private addRelationshipsToResource(jsonApiResource: JsonApiResource, relationships: Resource[] = [], response: JsonApiResponse): void {
		jsonApiResource.relationships = {};
		relationships.forEach((relationship: Resource) => {
			jsonApiResource.relationships[relationship.type] = { id: relationship.id, type: relationship.type };
			if(!response.included?.some(r => r.id === relationship.id && r.type === relationship.type)) {
				response.included?.push(relationship);
			}
		});
	}
}
