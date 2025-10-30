import { JsonApiResponseBuilder } from './JsonApiResponseBuilder';
import { Resource, ResponseType } from './Types';

describe('.buildResponse', () => {
	describe('with object type', () => {
		it('returns the resource object with all attributes', () => {
			const resource = {
				id: '42',
				type: 'organization',
				attributes: {
					name: 'Agile Freaks SRL',
					country: 'Romania',
					region: 'Sibiu',
				},
			};
			const builder = new JsonApiResponseBuilder(ResponseType.OBJECT, [resource]);

			expect(builder.buildResponse()).toEqual({
				data: {
					id: '42',
					type: 'organization',
					attributes: {
						name: 'Agile Freaks SRL',
						country: 'Romania',
						region: 'Sibiu',
					},
				},
			});
		});

		describe('with resource having relationship', () => {
			it('returns the resource relationship and included', () => {
				const resource = {
					id: '42',
					type: 'organization',
					attributes: {
						name: 'Agile Freaks SRL',
						country: 'Romania',
						region: 'Sibiu',
					},
					relationships: [
						{
							id: '42',
							type: 'sector',
							attributes: {
								name: 'Technology',
							},
						},
					],
				};
				const builder = new JsonApiResponseBuilder(ResponseType.OBJECT, [resource], true);

				expect(builder.buildResponse()).toEqual({
					data: {
						id: '42',
						type: 'organization',
						attributes: {
							name: 'Agile Freaks SRL',
							country: 'Romania',
							region: 'Sibiu',
						},
						relationships: {
							sector: {
								data: {
									id: '42',
									type: 'sector',
								},
							}
						},
					},
					included: [
						{
							id: '42',
							type: 'sector',
							attributes: {
								name: 'Technology',
							},
						},
					],
				});
			});
		});

		describe('with resource having different relationships', () => {
			it('returns the resource relationship and included', () => {
				const resource = {
					id: '42',
					type: 'organization',
					attributes: {
						name: 'Agile Freaks SRL',
						country: 'Romania',
						region: 'Sibiu',
					},
					relationships: [
						{
							id: '42',
							type: 'sector',
							attributes: {
								name: 'Technology',
							},
						},
						{
							id: '42',
							type: 'owner',
							attributes: {
								name: 'Boss',
							},
						},
					],
				};
				const builder = new JsonApiResponseBuilder(ResponseType.OBJECT, [resource], true);

				expect(builder.buildResponse()).toEqual({
					data: {
						id: '42',
						type: 'organization',
						attributes: {
							name: 'Agile Freaks SRL',
							country: 'Romania',
							region: 'Sibiu',
						},
						relationships: {
							sector:  {
								data: {
									id: '42',
									type: 'sector',
								},
							},
							owner: {
								data: {
									id: '42',
									type: 'owner',
								}
							},
						},
					},
					included: [
						{
							id: '42',
							type: 'sector',
							attributes: {
								name: 'Technology',
							},
						},
						{
							id: '42',
							type: 'owner',
							attributes: {
								name: 'Boss',
							},
						},
					],
				});
			});
		});

		describe('with resource having invalid relationship', () => {
			it('returns the resource relationship and included', () => {
				const resource = {
					id: '42',
					type: 'organization',
					attributes: {
						name: 'Agile Freaks SRL',
						country: 'Romania',
						region: 'Sibiu',
					},
					relationships: [
						{
							id: null,
							type: 'sector',
							attributes: {
								name: null,
							},
						},
					],
				} as unknown as Resource;
				const builder = new JsonApiResponseBuilder(ResponseType.OBJECT, [resource], true);

				expect(builder.buildResponse()).toEqual({
					data: {
						id: '42',
						type: 'organization',
						attributes: {
							name: 'Agile Freaks SRL',
							country: 'Romania',
							region: 'Sibiu',
						},
						relationships: {
							sector: {
								data: null
							}
						},
					},
					included: [],
				});
			});
		});
	});

	describe('with array type', () => {
		it('returns resource array with all their attributes', () => {
			const resources = [
				{
					id: '1',
					type: 'organization',
					attributes: { name: 'Agile Freaks SRL', country: 'USA' },
				},
				{
					id: '2',
					type: 'organization',
					attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
				},
				{
					id: '3',
					type: 'organization',
					attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
				},
			];

			const builder = new JsonApiResponseBuilder(ResponseType.ARRAY, resources);

			expect(builder.buildResponse()).toEqual({
				data: [
					{
						id: '1',
						type: 'organization',
						attributes: { name: 'Agile Freaks SRL', country: 'USA' },
					},
					{
						id: '2',
						type: 'organization',
						attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
					},
					{
						id: '3',
						type: 'organization',
						attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
					},
				],
			});
		});

		describe('with resources having relationships', () => {
			it('returns the resource relationship and included', () => {
				const resources = [
					{
						id: '1',
						type: 'organization',
						attributes: { name: 'Agile Freaks SRL', country: 'USA' },
						relationships: [
							{
								id: '1',
								type: 'sector',
								attributes: {
									name: 'Technology',
								},
							},
						],
					},
					{
						id: '2',
						type: 'organization',
						attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
						relationships: [
							{
								id: '2',
								type: 'sector',
								attributes: {
									name: 'Software',
								},
							},
						],
					},
					{
						id: '3',
						type: 'organization',
						attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
						relationships: [
							{
								id: '3',
								type: 'sector',
								attributes: {
									name: 'Food Industry',
								},
							},
						],
					},
				];

				const builder = new JsonApiResponseBuilder(ResponseType.ARRAY, resources, true);

				expect(builder.buildResponse()).toEqual({
					data: [
						{
							id: '1',
							type: 'organization',
							attributes: { name: 'Agile Freaks SRL', country: 'USA' },
							relationships: {
								sector:  {
									data: {
										id: '1',
										type: 'sector',
									},
								}
							},
						},
						{
							id: '2',
							type: 'organization',
							attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
							relationships: {
								sector:  {
									data: {
										id: '2',
										type: 'sector',
									},
								}
							},
						},
						{
							id: '3',
							type: 'organization',
							attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
							relationships: {
								sector:  {
									data: {
										id: '3',
										type: 'sector',
									},
								}
							},
						},
					],
					included: [
						{
							id: '1',
							type: 'sector',
							attributes: {
								name: 'Technology',
							},
						},
						{
							id: '2',
							type: 'sector',
							attributes: {
								name: 'Software',
							},
						},
						{
							id: '3',
							type: 'sector',
							attributes: {
								name: 'Food Industry',
							},
						},
					],
				});
			});
		});

		describe('with resources having the same relationship', () => {
			it('returns the resource relationship and included', () => {
				const resources = [
					{
						id: '1',
						type: 'organization',
						attributes: { name: 'Agile Freaks SRL', country: 'USA' },
						relationships: [
							{
								id: '1',
								type: 'sector',
								attributes: {
									name: 'Technology',
								},
							},
						],
					},
					{
						id: '2',
						type: 'organization',
						attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
						relationships: [
							{
								id: '1',
								type: 'sector',
								attributes: {
									name: 'Technology',
								},
							},
						],
					},
					{
						id: '3',
						type: 'organization',
						attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
						relationships: [
							{
								id: '1',
								type: 'sector',
								attributes: {
									name: 'Technology',
								},
							},
						],
					},
				];

				const builder = new JsonApiResponseBuilder(ResponseType.ARRAY, resources, true);

				expect(builder.buildResponse()).toEqual({
					data: [
						{
							id: '1',
							type: 'organization',
							attributes: { name: 'Agile Freaks SRL', country: 'USA' },
							relationships: {
								sector:  {
									data: {
										id: '1',
										type: 'sector',
									},
								}
							},
						},
						{
							id: '2',
							type: 'organization',
							attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
							relationships: {
								sector:  {
									data: {
										id: '1',
										type: 'sector',
									},
								}
							},
						},
						{
							id: '3',
							type: 'organization',
							attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
							relationships: {
								sector:  {
									data: {
										id: '1',
										type: 'sector',
									},
								}
							},
						},
					],
					included: [
						{
							id: '1',
							type: 'sector',
							attributes: {
								name: 'Technology',
							},
						},
					],
				});
			});
		});

		describe('with resources having the different relationships', () => {
			it('returns the resource relationship and included', () => {
				const resources = [
					{
						id: '1',
						type: 'organization',
						attributes: { name: 'Agile Freaks SRL', country: 'USA' },
						relationships: [
							{
								id: '1',
								type: 'sector',
								attributes: {
									name: 'Technology',
								},
							},
							{
								id: '1',
								type: 'owner',
								attributes: {
									name: 'Boss',
								},
							},
						],
					},
					{
						id: '2',
						type: 'organization',
						attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
						relationships: [
							{
								id: '1',
								type: 'sector',
								attributes: {
									name: 'Technology',
								},
							},
							{
								id: '1',
								type: 'owner',
								attributes: {
									name: 'Boss',
								},
							},
						],
					},
					{
						id: '3',
						type: 'organization',
						attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
						relationships: [
							{
								id: '1',
								type: 'sector',
								attributes: {
									name: 'Technology',
								},
							},
							{
								id: '1',
								type: 'owner',
								attributes: {
									name: 'Boss',
								},
							},
						],
					},
				];

				const builder = new JsonApiResponseBuilder(ResponseType.ARRAY, resources, true);

				expect(builder.buildResponse()).toEqual({
					data: [
						{
							id: '1',
							type: 'organization',
							attributes: { name: 'Agile Freaks SRL', country: 'USA' },
							relationships: {
								sector:  {
									data: {
										id: '1',
										type: 'sector',
									},
								},
								owner:  {
									data: {
										id: '1',
										type: 'owner',
									},
								}
							},
						},
						{
							id: '2',
							type: 'organization',
							attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
							relationships: {
								sector:  {
									data: {
										id: '1',
										type: 'sector',
									},
								},
								owner:  {
									data: {
										id: '1',
										type: 'owner',
									},
								}
							},
						},
						{
							id: '3',
							type: 'organization',
							attributes: { name: 'Agile Freaks SRL', country: 'Germany' },
							relationships: {
								sector:  {
									data: {
										id: '1',
										type: 'sector',
									},
								},
								owner:  {
									data: {
										id: '1',
										type: 'owner',
									},
								}
							},
						},
					],
					included: [
						{
							id: '1',
							type: 'sector',
							attributes: {
								name: 'Technology',
							},
						},
						{
							id: '1',
							type: 'owner',
							attributes: {
								name: 'Boss',
							},
						},
					],
				});
			});
		});
	});
});
