import { NodeOperationError, type INode, type IExecuteFunctions } from 'n8n-workflow';
import { Relationship, Resource } from './Types';

export function parseResource(context: IExecuteFunctions, index: number): Resource | undefined {
	const type = context.getNodeParameter('resource_type', index) as string;
	const id = context.getNodeParameter('resource_id', index) as string;
	const resourceAttributes = context.getNodeParameter('resource_attributes', index) as string;

	if (!id || !resourceAttributes || resourceAttributes.trim() === '' || resourceAttributes.trim() === '{}') {
		return undefined;
	}

	const attributes = parseAttributes(context.getNode(), resourceAttributes);
	const relationships = parseRelationships(context, index);

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

function parseRelationships(context: IExecuteFunctions, index: number): Relationship[] {
	const enableIncludeResources = context.getNodeParameter('enable_include_resources', 0, false) as boolean;
	if (!enableIncludeResources) return [];

	const rawIncluded = context.getNodeParameter('included', index) as any;
	if (!rawIncluded.resources?.length) return [];

	return rawIncluded.resources.map((includedResource: any) =>
		includedResource.relationshipType === 'one-to-many'
			? parseOneToManyRelationship(includedResource)
			: parseOneToOneRelationship(context.getNode(), includedResource)
	);
}

function parseOneToOneRelationship(node: INode, raw: any): Relationship {
	const attributes = parseAttributes(node, raw.attributes);
	const id = attributes.id;
	delete attributes.id;

	return {
		name: raw.relationshipName || raw.type,
		relationshipType: 'one-to-one',
		resources: [{ id, type: raw.type, attributes }],
	};
}

function parseOneToManyRelationship(raw: any): Relationship {
	const sourceArray: any[] = Array.isArray(raw.sourceArray)
		? raw.sourceArray
		: raw.sourceArray ? JSON.parse(raw.sourceArray) : [];

	const keys: string[] = raw.arrayAttributes
		? raw.arrayAttributes.split(',').map((k: string) => k.trim()).filter(Boolean)
		: [];

	const resources = sourceArray.map((item: any) => {
		const attrs = keys.length > 0
			? Object.fromEntries(keys.map((k) => [k, item[k]]))
			: { ...item };
		const id = String(attrs.id);
		delete attrs.id;
		return { id, type: raw.type, attributes: attrs } as Resource;
	});

	return {
		name: raw.relationshipName || raw.type,
		relationshipType: 'one-to-many',
		resources,
	};
}
