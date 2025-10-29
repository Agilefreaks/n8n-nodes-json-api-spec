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
- `relationships` (optional) - Relationships to other resources
- `included` (optional) - Array of related resources included in the response

### Serialize Resources Array
Serializes multiple resources into JSON API format with a `data` array, where each item contains:
- `id` - The resource identifier
- `type` - The resource type
- `attributes` - The resource attributes as a JSON object
- `relationships` (optional) - Relationships to other resources
- `included` (optional) - Array of related resources included in the response

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

### Example with Relationships and Included Resources

**Input parameters:**
- Response: `Resource Object`
- Type: `organization`
- ID: `6937`
- Attributes: `{"name": "Test organization", "country": "Kenya", "region": "africa"}`
- Relationships: `{"sector": {"data": {"type": "sector", "id": "1"}}}`
- Included: `[{"type": "sector", "id": "1", "attributes": {"name": "Technology", "icb_number": "10101010", "identifier": "technology", "created_at": "2026-01-28T00:00:00Z", "updated_at": "2026-01-30T00:00:00Z"}}]`

**Output:**
```json
{
  "data": {
    "id": "6937",
    "type": "organization",
    "attributes": {
      "name": "Test organization",
      "country": "Kenya",
      "region": "africa"
    },
    "relationships": {
      "sector": {
        "data": {
          "type": "sector",
          "id": "1"
        }
      }
    }
  },
  "included": [
    {
      "type": "sector",
      "id": "1",
      "attributes": {
        "name": "Technology",
        "icb_number": "10101010",
        "identifier": "technology",
        "created_at": "2026-01-28T00:00:00Z",
        "updated_at": "2026-01-30T00:00:00Z"
      }
    }
  ]
}
```

### Tips
- The **Attributes** field accepts JSON format - make sure your JSON is valid
- The **Relationships** field is optional and should follow the format: `{"relationName": {"data": {"type": "...", "id": "..."}}}`
- The **Included** field is optional and should be an array of related resources: `[{"type": "...", "id": "...", "attributes": {...}}]`
- Use the **Resource Object** response type when you need to serialize a single item
- Use the **Resources Array** response type when working with multiple items from previous nodes
- The node follows the [JSON API v1.0 specification](https://jsonapi.org/format/)

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [JSON API Specification](https://jsonapi.org/)
* [JSON API Format Documentation](https://jsonapi.org/format/)

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
