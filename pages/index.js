import React from 'react';
import { Heading, Page, TextStyle, Layout, EmptyState } from "@shopify/polaris";
import { ResourcePicker, TitleBar } from '@shopify/app-bridge-react';
import store from 'store-js';
import ResourceListWithProducts from './components/ResourceList';

const img = 'https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png';

class Index extends React.Component {
  state = { open: false };

  handleSelection = resources => {
    console.log("RESOURCES", resources);

    const idsFromResources = resources.selection.map(product => product.id);
    this.setState({ open: false });
    store.set('ids', idsFromResources);
  }

  render() {
    const emptystate = !store.get('ids');

    return (
      <Page>
        <TitleBar
          primaryAction={{
            content: 'Select products',
            onAction: () => this.setState({ open: true })
          }}
        />
        <ResourcePicker
          resourceType='Product'
          showVariants={false}
          open={this.state.open}
          onSelection={resources => this.handleSelection(resources)}
          onCancel={() => this.setState({ open: false })}
        />
        {emptystate ? (
          <Layout>
            <EmptyState // Empty state component
              heading="Discount your products temporarily"
              action={{
                content: 'Select products',
                onAction: () => this.setState({ open: true }),
              }}
              image={img}
            >
              <p>Select products to change their price temporarily.</p>
            </EmptyState>
          </Layout>
        ) : (
          // <p>Pendejo</p>
          <ResourceListWithProducts />
        )}
      </Page>
    )
  }
};

export default Index;

