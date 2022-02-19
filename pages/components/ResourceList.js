import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Card, ResourceItem, ResourceList, Stack, TextStyle, Thumbnail } from '@shopify/polaris';
import store from 'store-js';
import { Redirect } from '@shopify/app-bridge/actions';
import { Context } from '@shopify/app-bridge';
import ApplyRandomPrices from './ApplyRandomPrices';

const GET_PRODUCTS_BY_ID = gql`
  query getProducts($ids: [ID!]!){
    nodes(ids: $ids) {
      ... on Product {
        title
        handle
        descriptionHtml
        id
        images(first: 1){
          edges {
            node {
              id
              altText
            }
          }
        }
        variants(first: 1 ){
          edges {
            node {
              price
              id
            }
          }
        }
      }
    }
  }
`;

class ResourceListWithProducts extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedItems: [],
      selectedNodes: {}
    };
  }

  handleRenderItem = (item, nodesById) => {
    const media = (
      <Thumbnail
        source={
          item.images.edges[0]
            ? item.images.edges[0].node.id
            : ''
        }
        alt={
          item.images.edges[0]
            ? item.images.edges[0].node.altText
            : ''
        }
      />
    );

    const price = item.variants.edges[0].node.price;

    return (
      <ResourceItem
        id={item.id}
        media={media}
        accessibilityLabel={`View details for ${item.title}`}
        verticalAlignment='center'
        onClick={() => {
          let index = this.state.selectedItems.indexOf(item.id);
          const node = nodesById[item.id];

          if (index === -1) {
            this.state.selectedItems.push(item.id);
            this.state.selectedNodes[item.id] = node;
          } else {
            this.state.selectedItems.splice(index, 1);
            delete this.state.selectedNodes[item.id];
          }

          this.setState({
            selectedItems: this.state.selectedItems,
            selectedNodes: this.state.selectedNodes,
          });
        }}
      >
        <Stack alignment='center'>
          <Stack.Item fill>
            <h3>
              <TextStyle variation="strong">
                {item.title}
              </TextStyle>
            </h3>
          </Stack.Item>
          <Stack.Item>
            <p>${price}</p>
          </Stack.Item>
        </Stack>
      </ResourceItem>
    );
  }

  handleSelectionChange = (selectedItems, nodesById) => {
    const selectedNodes = {};
    selectedItems.forEach(item => selectedNodes[item] = nodesById[item]);

    return this.setState({
      selectedItems: selectedItems,
      selectedNodes: selectedNodes
    });
  }

  render() {

    return (
      // GraphQL query to retrieve products and their prices
      <Query query={GET_PRODUCTS_BY_ID} variables={{ ids: store.get('ids') }}>
        {({ data, loading, error, refetch }) => {
          if (loading) return <div>Loading…</div>;
          if (error) return <div>{error.message}</div>;

          console.log("DATA->", data)
          const nodesById = {};
          data.nodes.forEach(node => nodesById[node.id] = node);

          return (
            <React.Fragment>
              <Card>
                <ResourceList
                  showHeader
                  resourceName={{ singular: 'Product', plural: 'Products' }}
                  items={data.nodes}
                  selectable
                  selectedItems={this.state.selectedItems}
                  onSelectionChange={(selectedItems) => this.handleSelectionChange(selectedItems, nodesById)}
                  renderItem={item => this.handleRenderItem(item, nodesById)}
                />
              </Card>
              <ApplyRandomPrices selectedItems={this.state.selectedNodes} onUpdate={refetch} />
            </React.Fragment>
          );
        }}
      </Query>
    );
  }
}

export default ResourceListWithProducts;

