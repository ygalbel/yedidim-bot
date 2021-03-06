import { StackNavigator } from 'react-navigation';
import EventsList from "./EventsList";
import EventDetails from './EventDetails';

const EventsScreen = StackNavigator({
  EventList: {
    screen: EventsList,
    navigationOptions: {
      title: 'אירועים',
    }
  },
  EventDetails: {
    screen: EventDetails,
    navigationOptions: {
      title: 'פרטים',
    }
  },
});

export default EventsScreen;