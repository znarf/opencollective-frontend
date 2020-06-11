import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { Dimensions } from '../collective-page/_constants';
import Container from '../Container';
import { Flex } from '../Grid';

import RecurringContributionsCard from './RecurringContributionsCard';

const CollectiveCardContainer = styled.div`
  width: 280px;
  padding: 20px 15px;
`;

const RecurringContributionsContainer = ({ recurringContributions, filter, createNotification, account }) => {
  const activeRecurringContributions = recurringContributions.nodes.filter(
    contribution => contribution.status === 'ACTIVE',
  );
  const monthlyRecurringContributions = activeRecurringContributions.filter(
    contribution => contribution.status === 'ACTIVE' && contribution.frequency === 'MONTHLY',
  );
  const yearlyRecurringContributions = activeRecurringContributions.filter(
    contribution => contribution.status === 'ACTIVE' && contribution.frequency === 'YEARLY',
  );
  const cancelledRecurringContributions = recurringContributions.nodes.filter(
    contribution => contribution.status === 'CANCELLED',
  );

  let displayedRecurringContributions;
  if (filter === 'active') {
    displayedRecurringContributions = activeRecurringContributions;
  } else if (filter === 'monthly') {
    displayedRecurringContributions = monthlyRecurringContributions;
  } else if (filter === 'yearly') {
    displayedRecurringContributions = yearlyRecurringContributions;
  } else if (filter === 'cancelled') {
    displayedRecurringContributions = cancelledRecurringContributions;
  }

  return (
    <Container maxWidth={Dimensions.MAX_SECTION_WIDTH} pl={Dimensions.PADDING_X} mt={4} mx="auto">
      <Flex flexWrap="wrap" justifyContent={['space-evenly', 'left']} my={2}>
        {displayedRecurringContributions.map(contribution => (
          <CollectiveCardContainer key={`${contribution.id}-container`}>
            <RecurringContributionsCard
              key={contribution.id}
              mx={3}
              width={250}
              height={360}
              collective={contribution.toAccount}
              status={contribution.status}
              contribution={contribution}
              style={{ position: 'relative' }}
              createNotification={createNotification}
              account={account}
              data-cy="recurring-contribution-card"
            />
          </CollectiveCardContainer>
        ))}
      </Flex>
    </Container>
  );
};

RecurringContributionsContainer.propTypes = {
  recurringContributions: PropTypes.object.isRequired,
  filter: PropTypes.string.isRequired,
  createNotification: PropTypes.func,
  account: PropTypes.object.isRequired,
};

export default RecurringContributionsContainer;
