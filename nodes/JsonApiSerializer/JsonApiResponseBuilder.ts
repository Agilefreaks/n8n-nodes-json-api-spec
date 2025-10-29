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
			const resource = this.resources[0];
			const jsonApiResource = { id: resource.id, type: resource.type, attributes: resource.attributes } as JsonApiResource;

			if (this.has_relationships) {
				response.included = [];

				jsonApiResource.relationships = {};
				resource.relationships?.forEach((relationship: Resource) => {
					jsonApiResource.relationships[relationship.type] = { id: relationship.id, type: relationship.type };
					response.included?.push(relationship);
				});
			}

			response.data = jsonApiResource;
		} else {
			if (this.has_relationships) {
				response.included = [];

				response.data = this.resources.map(resource => {
					const jsonApiResource = { id: resource.id, type: resource.type, attributes: resource.attributes } as JsonApiResource;
					jsonApiResource.relationships = {};
					resource.relationships?.map((relationship: Resource) => {
						jsonApiResource.relationships[relationship.type] = { id: relationship.id, type: relationship.type };
						if(!response.included?.some(resource => resource.id === relationship.id && resource.type === relationship.type)) {
							response.included?.push(relationship)
						}
					});
					return jsonApiResource;
				});
			}
			else {
				response.data = this.resources;
			}
		}

		return response;
	}
}
