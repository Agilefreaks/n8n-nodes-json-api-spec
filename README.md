# n8n-nodes-json-api-spec

This is an n8n community node. It lets you serialize data to JSON API Specification format in your n8n workflows.

[JSON API](https://jsonapi.org/) is a specification for building APIs in JSON. This node helps you transform your data into JSON API compliant format with proper structure including resource type, id, and attributes.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)  
[TODO](#todo)
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

### Serialize Resource Object and Array with Relationships
The optional parameter `included` will add `data.relationshiphs` and `included` keys with the resources provided.

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
- Include Resources:
  - Resource:
    - Type: `sector`
    - Attributes: `{"id": "1", "name": "Technology"}`

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
        "id": "1",
        "type": "sector"
      }
    }
  },
  "included": [
    {
      "id": "1",
      "type": "sector",
      "attributes": {
        "name": "Technology"
      }
    }
  ]
}
```

### Example with Multiple Included Resources

**Input parameters:**
- Response: `Resource Object`
- Type: `organization`
- ID: `42`
- Attributes: `{"name": "Agile Freaks SRL", "country": "Romania", "region": "Sibiu"}`
- Include Resources:
  - Resource:
    - Type: `sector`
    - Attributes: `{"id": "1", "name": "Technology"}`
  - Resource:
    - Type: `owner`
    - Attributes: `{"id": "1", "name": "Boss"}`

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
    },
    "relationships": {
      "sector": {
        "id": "1",
        "type": "sector"
      },
      "owner": {
        "id": "1",
        "type": "owner"
      }
    }
  },
  "included": [
    {
      "id": "1",
      "type": "sector",
      "attributes": {
        "name": "Technology"
      }
    },
    {
      "id": "1",
      "type": "owner",
      "attributes": {
        "name": "Boss"
      }
    }
  ]
}
```

### Example with Custom Relationship Name

You can specify a custom name for relationships that differs from the resource type. This is useful when the semantic meaning of the relationship differs from the resource type itself.

**Input parameters:**
- Response: `Resource Object`
- Type: `contact`
- ID: `42`
- Attributes: `{"name": "Mister Daniel"}`
- Include Resources:
  - Resource:
    - Type: `organization`
    - Relationship Name: `membership`
    - Attributes: `{"id": "42", "name": "Agile Freaks SRL", "country": "Romania", "region": "Sibiu"}`

**Output:**
```json
{
  "data": {
    "id": "42",
    "type": "contact",
    "attributes": {
      "name": "Mister Daniel"
    },
    "relationships": {
      "membership": {
        "data": {
          "id": "42",
          "type": "organization"
        }
      }
    }
  },
  "included": [
    {
      "id": "42",
      "type": "organization",
      "attributes": {
        "name": "Agile Freaks SRL",
        "country": "Romania",
        "region": "Sibiu"
      }
    }
  ]
}
```

In this example, even though the resource type is `organization`, the relationship is named `membership` to better represent the semantic relationship between a contact and their organization.

### Tips
- The **Attributes** field accepts JSON format - make sure your JSON is valid
- The **Include Resources** field is optional. Add one or more resources that will appear in both the `relationships` and `included` sections
  - Each included resource requires a **Type**
  - The **Relationship Name** is required and specifies the key name for the relationship in the output
  - The **Attributes** must be a JSON object that includes an `id` field - this `id` will be extracted and used for the relationship reference
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


## TODO

### Array Support for Relationships
Currently, relationships and included resources work only with single object responses. The following enhancements are planned:

- [ ] Support relationships and included resources for array responses

## License

[MIT](LICENSE.md)
