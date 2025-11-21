import { NodeOperationError, type INode, type IExecuteFunctions } from 'n8n-workflow';
import { Resource } from './Types';

export function parseResource(context: IExecuteFunctions, index: number): Resource {
	const type = context.getNodeParameter('resource_type', index) as string;
	const id = context.getNodeParameter('resource_id', index) as string;
	const resourceAttributes = context.getNodeParameter('resource_attributes', index) as string;
	const attributes = parseAttributes(context.getNode(), resourceAttributes);
	const relationships = parseRelationships(context);

	const resource: Resource = { id, type, attributes };

	if (relationships.length > 0) {
		resource.relationships = relationships;
	}

	return resource;
}

export function parseAttributes(node: INode, attributes: string): any {
	try {
		return JSON.parse(attributes);
	} catch (exception) {
		throw new NodeOperationError(node, 'Attributes must be a valid json');
	}
}

function parseRelationships(context: IExecuteFunctions): Resource[] {
	const rawIncluded = context.getNodeParameter('included', 0) as any;
	if (!rawIncluded.resources?.length) {
		return [];
	}

	return rawIncluded.resources.map((includedResource: any) => {
		const type = includedResource.type;
		const relationshipName = includedResource.relationshipName;
		const attributes = parseAttributes(context.getNode(), includedResource.attributes);
		const id = attributes.id;
		delete attributes.id;

		const resource: Resource = { id, type, attributes };
		if (relationshipName) {
			resource.relationshipName = relationshipName;
		}

		return resource;
	});
}
