# n8n-nodes-json-api-spec

This is an n8n community node. It lets you serialize data to JSON API Specification format in your n8n workflows.

[JSON API](https://jsonapi.org/) is a specification for building APIs in JSON. This node helps you transform your data into JSON API compliant format with proper structure including resource type, id, and attributes.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)
## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

The **JSON API Serializer** node supports the following operations:

### Serialize Resource Object
Serializes a single resource into JSON API format with a `data` object containing:
- `id` - The resource identifier
- `type` - The resource type
- `attributes` - The resource attributes as a JSON object

### Serialize Resources Array
Serializes multiple resources into JSON API format with a `data` array, where each item contains:
- `id` - The resource identifier
- `type` - The resource type
- `attributes` - The resource attributes as a JSON object

### Pagination Support
Optionally includes JSON API compliant pagination information with:
- `meta` - Metadata including page info (current page, page size, total pages) and custom fields
- `links` - Navigation links (first, prev, next, last) with auto-generated URLs

## Compatibility

- Tested against: n8n 1.113.3

## Usage

### Basic Example - Single Resource

**Input parameters:**
- Response: `Resource Object`
- Type: `organization`
- ID: `42`
- Attributes: `{"name": "Agile Freaks SRL", "country": "Romania", "region": "Sibiu"}`

**Output:**
```json
{
  "data": {
    "id": "42",
    "type": "organization",
    "attributes": {
      "name": "Agile Freaks SRL",
      "country": "Romania",
      "region": "Sibiu"
    }
  }
}
```

### Multiple Resources Example

**Input parameters:**
- Response: `Resources Array`
- Configure the Type, ID, and Attributes for each input item

**Output:**
```json
{
  "data": [
    {
      "id": "1",
      "type": "organization",
      "attributes": {
        "name": "Agile Freaks SRL",
        "country": "USA"
      }
    },
    {
      "id": "2",
      "type": "organization",
      "attributes": {
        "name": "Agile Freaks SRL",
        "country": "Germany"
      }
    }
  ]
}
```

### Pagination Example

**Input parameters:**
- Response: `Resources Array`
- Enable Pagination: `true`
- URL: `https://api.example/organizations`
- Current Page: `1`
- Page Size: `3`
- Total Pages: `3000`
- Query Parameters (Filters): `{"filter": {"name": "freak", "country": "Romania"}}`
- Custom Metadata Input Mode: `JSON`
- Custom Meta (JSON): `{"total_organization_count": "9000"}`

**Output:**
```json
{
  "data": [
    {
      "id": "1",
      "type": "organization",
      "attributes": {
        "name": "Agile Freaks SRL",
        "country": "Romania"
      }
    },
    {
      "id": "2",
      "type": "organization",
      "attributes": {
        "name": "Agile Freaks",
        "country": "Romania"
      }
    },
    {
      "id": "3",
      "type": "organization",
      "attributes": {
        "name": "AgileFreaks",
        "country": "Romania"
      }
      }
    }
  ],
  "meta": {
    "page": {
      "current": 1,
      "size": 3,
      "total": 9000
    },
    "total_organization_count": "9000"
  },
  "links": {
    "first": "https://localhost:5678/webhook/v1/organizations?filter%5Bname%5D=freak&filter%5Bcountry%5D=Romania&page%5Bnumber%5D=1&page%5Bsize%5D=3",
    "prev": null,
    "next": "https://localhost:5678/webhook/v1/organizations?filter%5Bname%5D=freak&filter%5Bcountry%5D=Romania&page%5Bnumber%5D=2&page%5Bsize%5D=3",
    "last": "https://localhost:5678/webhook/v1/organizations?filter%5Bname%5D=cfreak&filter%5Bcountry%5D=Romania&page%5Bnumber%5D=3000&page%5Bsize%5D=3"
  }
}
```

### Custom Metadata Input Modes

The **Custom Metadata** field supports two input modes:

#### JSON Mode
Enter metadata as a JSON object directly:
```json
{"total_organization_count": "9000", "filter_applied": true}
```

#### Fields Mode
Add metadata fields individually using name/value pairs:
- Field Name: `total_organization_count`
- Field Value: `9000`
- *(Click "Add Field" to add more)*

Both modes produce the same output in the `meta` section. Use **Fields mode** for simpler cases and **JSON mode** when you need complex nested structures.

### Tips
- The **Attributes** field accepts JSON format - make sure your JSON is valid
- Use the **Resource Object** response type when you need to serialize a single item
- Use the **Resources Array** response type when working with multiple items from previous nodes
- Enable **Pagination** to add JSON API compliant pagination metadata and links
- **Pagination fields** (Current Page, Page Size, Total Pages) are entered as separate numeric fields
- Use **Query Parameters (Filters)** field to add filters that will be preserved across all pagination links
  - Example: `{"filter": {"name": "freak", "country": "Romania"}}`
  - These filters will appear in all pagination links (first, prev, next, last)
- Pagination links use **URL encoding**
- The **Custom Metadata** field has two modes:
  - **Fields mode**: Add metadata using simple name/value pairs (easier for basic cases)
  - **JSON mode**: Enter metadata as a JSON object (better for complex nested structures)
- On the first page, `prev` will be `null`; on the last page, `next` will be `null`
- The node follows the [JSON API v1.0 specification](https://jsonapi.org/format/)

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [JSON API Specification](https://jsonapi.org/)
* [JSON API Format Documentation](https://jsonapi.org/format/)

## Todos
- support include and relationships

## Development Setup

1. Clone this repository.
2. Install node and npm. https://nodejs.org/en/download
3. Install pnpm
```bash
npm i -g pnpm
```
4. Install local package
```bash
pnpm install
```
5. Build n8n
```bash
pnpm run build
```
6. Run n8n in docker mode
7. Configure n8n docker container to use this custom node. Add the following volume for n8n-main service
```yaml
  volumes:
    - ~/n8n-nodes-json-api-spec/dist:/home/node/.n8n/custom/node_modules/n8n-nodes-json-api-spec
```

## Development
1. Make changes to nodes or credentials
2. Delete compiled files
```bash
rm -rf dist
```
3. Build packages and n8n
```bash
pnpm run build
```
4. Restart n8n (make sure to be in n8n directory)
```bash
docker compose restart n8n-main
```

## Publishing Package on npm
1. Update version (patch / minor / major)
```bash
npm version patch
```

2. Push version update on git
```bash
git push
```

3. Publish version on npm
```bash
npm publish
```


## License

[MIT](LICENSE.md)
