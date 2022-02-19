import React, { useState } from 'react';
import gql from 'graphql-tag';
import { Mutation, Query } from 'react-apollo';
import { Layout, Button, Banner, Toast, Stack, Frame } from '@shopify/polaris';
import { Context } from '@shopify/app-bridge-react';

const UPDATE_PRICE = gql`
  mutation productVariantUpdate($input: ProductVariantInput!){
    productVariantUpdate(input: $input){
      product {
        title
      }
      productVariant {
        id
        price
      }
    }
  }
`;

class ApplyRandomPrices extends React.Component {

  handleRandomize = (submit, callback) => {
    let promise = new Promise((resolve, reject) => resolve());

    for (const variantId in this.props.selectedItems) {
      const price = parseFloat(Math.random().toPrecision(3)) * 10;
      const productVariableInput = {
        id: this.props.selectedItems[variantId].variants.edges[0].node.id,
        price: price,
      };

      promise = promise.then(() => {
        return submit({
          variables: {
            input: productVariableInput
          }
        })
      });
    }

    if (promise) {
      promise.then(() => this.props.onUpdate().then(() => callback));
    }
  }

  render() {
    return (
      <Mutation mutation={UPDATE_PRICE}>
        {(handleSubmit, { error, data }) => {
          const [hasResults, setHasResults] = useState(false);

          const showError = error && (<Banner status='critical'>{error.message}</Banner>)
          console.log(error)

          const showToast = hasResults && (<Toast content='Successfully updated' onDismiss={() => setHasResults(false)} />)

          return (
            <Frame>
              {showToast}
              <Layout.Section>
                {showError}
              </Layout.Section>

              <Layout.Section>
                <Stack distribution='center'>
                  <Button
                    primary
                    textAlign='center'
                    onClick={() => this.handleRandomize(handleSubmit, () => setHasResults(true))}
                  >
                    Randomize Prices
                  </Button>
                </Stack>
              </Layout.Section>
            </Frame>
          )
        }}
      </Mutation>
    )
  }
}

export default ApplyRandomPrices;

