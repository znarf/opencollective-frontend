import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { graphql } from '@apollo/react-hoc';
import { FormattedMessage, injectIntl } from 'react-intl';

import { API_V2_CONTEXT, gqlV2 } from '../../../lib/graphql/helpers';

import { Dimensions } from '../_constants';
import Container from '../../Container';
import { Box, Flex } from '../../Grid';
import I18nFormatters from '../../I18nFormatters';
import LoadingPlaceholder from '../../LoadingPlaceholder';
import MessageBox from '../../MessageBox';
import RecurringContributionsContainer from '../../recurring-contributions/RecurringContributionsContainer';
import StyledFilters from '../../StyledFilters';
import TemporaryNotification from '../../TemporaryNotification';
import { P } from '../../Text';
import { withUser } from '../../UserProvider';
import ContainerSectionContent from '../ContainerSectionContent';
// Local imports
import SectionTitle from '../SectionTitle';

import EmptyCollectivesSectionImageSVG from '../images/EmptyCollectivesSectionImage.svg';

export const recurringContributionsPageQuery = gqlV2/* GraphQL */ `
  query RecurringContributions($slug: String) {
    account(slug: $slug) {
      id
      slug
      name
      type
      description
      settings
      imageUrl
      twitterHandle
      orders {
        totalCount
        nodes {
          id
          paymentMethod {
            id
          }
          amount {
            value
            currency
          }
          status
          frequency
          tier {
            id
            name
          }
          totalDonations {
            value
            currency
          }
          toAccount {
            id
            slug
            name
            description
            tags
            imageUrl
            settings
          }
        }
      }
    }
  }
`;

class SectionRecurringContributions extends React.Component {
  static getInitialProps({ query: { slug } }) {
    return { slug };
  }

  static propTypes = {
    slug: PropTypes.string.isRequired,
    LoggedInUser: PropTypes.object,
    data: PropTypes.shape({
      loading: PropTypes.bool,
      error: PropTypes.any,
      account: PropTypes.object.isRequired,
    }), // from withData
  };

  constructor(props) {
    super(props);
    this.state = { filter: 'active', notification: false, notificationType: null, notificationText: null };
  }

  createNotification = (type, error) => {
    this.setState({ notification: true });
    if (type === 'error') {
      this.setState({ notificationType: 'error' });
      this.setState({ notificationText: error });
    } else {
      this.setState({ notificationType: type });
    }
    window.scrollTo(0, 0);
  };

  dismissNotification = () => {
    this.setState(state => ({
      ...state.filter,
      notification: false,
      notificationType: null,
      notificationText: null,
    }));
  };

  render() {
    const { data, LoggedInUser } = this.props;
    const { notification, notificationType, notificationText } = this.state;

    const filters = ['active', 'monthly', 'yearly', 'cancelled'];

    if (data.loading || !LoggedInUser) {
      return <LoadingPlaceholder height={600} borderRadius={0} />;
    } else if (!data.account) {
      return (
        <Container display="flex" border="1px dashed #d1d1d1" justifyContent="center" py={[6, 7]} background="#f8f8f8">
          <MessageBox type="error" withIcon>
            <FormattedMessage
              id="NCP.SectionFetchError"
              defaultMessage="We encountered an error while retrieving the data for this section."
            />
          </MessageBox>
        </Container>
      );
    }

    const collective = data && data.account;
    const recurringContributions = collective && collective.orders;
    const hasRecurringContributions = recurringContributions.nodes.length;

    return (
      <Fragment>
        {!hasRecurringContributions ? (
          <Flex flexDirection="column" alignItems="center">
            <img src={EmptyCollectivesSectionImageSVG} alt="" />
            <P color="black.600" fontSize="LeadParagraph" mt={5}>
              <FormattedMessage
                id="CollectivePage.SectionRecurringContributions.Empty"
                defaultMessage="{collectiveName} doesn't seem to to have any recurring contributions yet! 😔"
                values={{ collectiveName: collective.name }}
              />
            </P>
          </Flex>
        ) : (
          <Fragment>
            {notification && (
              <TemporaryNotification
                onDismiss={this.dismissNotification}
                type={notificationType === 'error' ? 'error' : 'default'}
              >
                {notificationType === 'activate' && (
                  <FormattedMessage
                    id="subscription.createSuccessActivate"
                    defaultMessage="Recurring contribution <strong>activated</strong>! Woohoo! 🎉"
                    values={I18nFormatters}
                  />
                )}
                {notificationType === 'cancel' && (
                  <FormattedMessage
                    id="subscription.createSuccessCancel"
                    defaultMessage="Your recurring contribution has been <strong>cancelled</strong>."
                    values={I18nFormatters}
                  />
                )}
                {notificationType === 'update' && (
                  <FormattedMessage
                    id="subscription.createSuccessUpdated"
                    defaultMessage="Your recurring contribution has been <strong>updated</strong>."
                    values={I18nFormatters}
                  />
                )}
                {notificationType === 'error' && <P>{notificationText}</P>}
              </TemporaryNotification>
            )}
            <Box pt={5} pb={3}>
              <ContainerSectionContent>
                <SectionTitle data-cy="section-contributions-title" textAlign="left" mb={1}>
                  <FormattedMessage
                    id="CollectivePage.SectionRecurringContributions.Title"
                    defaultMessage="Recurring contributions"
                  />
                </SectionTitle>
                <Box mt={4} mx="auto" maxWidth={Dimensions.MAX_SECTION_WIDTH}>
                  <StyledFilters
                    filters={filters}
                    selected={this.state.filter}
                    justifyContent="left"
                    minButtonWidth={175}
                    px={Dimensions.PADDING_X}
                    onChange={filter => this.setState({ filter: filter })}
                  >
                    <FormattedMessage id="Subscriptions.Active" defaultMessage="Active" />
                  </StyledFilters>
                </Box>
                <RecurringContributionsContainer
                  recurringContributions={recurringContributions}
                  account={collective}
                  filter={this.state.filter}
                  createNotification={this.createNotification}
                />
              </ContainerSectionContent>
            </Box>
          </Fragment>
        )}
      </Fragment>
    );
  }
}

const getData = graphql(recurringContributionsPageQuery, {
  options: {
    context: API_V2_CONTEXT,
  },
});

export default injectIntl(withUser(getData(SectionRecurringContributions)));
