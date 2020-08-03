import { 
  Container,
  Divider,
  Card,
  CardHeader,
  CardContent,
  Button,
  Typography,
  Box,
  Grid
} from '@material-ui/core';
import styled from 'styled-components';

import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import React  from 'react';
import { ReactMeteorData } from 'meteor/react-meteor-data';
import ReactMixin  from 'react-mixin';

import MessageHeaderDetail from './MessageHeaderDetail';
import MessageHeadersTable from './MessageHeadersTable';
import LayoutHelpers from '../../lib/LayoutHelpers';

import { StyledCard, PageCanvas } from 'material-fhir-ui';

import { get, cloneDeep } from 'lodash';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

Session.setDefault('messageHeaderPageTabIndex', 0);
Session.setDefault('messageHeaderSearchFilter', '');
Session.setDefault('selectedMessageHeaderId', '');
Session.setDefault('selectedMessageHeader', false);
Session.setDefault('fhirVersion', 'v1.0.2');
Session.setDefault('messageHeadersArray', []);
Session.setDefault('MessageHeadersPage.onePageLayout', true)

// Global Theming 
  // This is necessary for the Material UI component render layer
  let theme = {
    primaryColor: "rgb(108, 183, 110)",
    primaryText: "rgba(255, 255, 255, 1) !important",

    secondaryColor: "rgb(108, 183, 110)",
    secondaryText: "rgba(255, 255, 255, 1) !important",

    cardColor: "rgba(255, 255, 255, 1) !important",
    cardTextColor: "rgba(0, 0, 0, 1) !important",

    errorColor: "rgb(128,20,60) !important",
    errorText: "#ffffff !important",

    appBarColor: "#f5f5f5 !important",
    appBarTextColor: "rgba(0, 0, 0, 1) !important",

    paperColor: "#f5f5f5 !important",
    paperTextColor: "rgba(0, 0, 0, 1) !important",

    backgroundCanvas: "rgba(255, 255, 255, 1) !important",
    background: "linear-gradient(45deg, rgb(108, 183, 110) 30%, rgb(150, 202, 144) 90%)",

    nivoTheme: "greens"
  }

  // if we have a globally defined theme from a settings file
  if(get(Meteor, 'settings.public.theme.palette')){
    theme = Object.assign(theme, get(Meteor, 'settings.public.theme.palette'));
  }

  const muiTheme = createMuiTheme({
    typography: {
      useNextVariants: true,
    },
    palette: {
      primary: {
        main: theme.primaryColor,
        contrastText: theme.primaryText
      },
      secondary: {
        main: theme.secondaryColor,
        contrastText: theme.errorText
      },
      appBar: {
        main: theme.appBarColor,
        contrastText: theme.appBarTextColor
      },
      cards: {
        main: theme.cardColor,
        contrastText: theme.cardTextColor
      },
      paper: {
        main: theme.paperColor,
        contrastText: theme.paperTextColor
      },
      error: {
        main: theme.errorColor,
        contrastText: theme.secondaryText
      },
      background: {
        default: theme.backgroundCanvas
      },
      contrastThreshold: 3,
      tonalOffset: 0.2
    }
  });

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      <Box p={3}>{children}</Box>
    </Typography>
  );
}


export class MessageHeadersPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messageHeaderId: false,
      messageHeader: {}
    }
  }
  getMeteorData() {
    let data = {
      tabIndex: Session.get('messageHeaderPageTabIndex'),
      messageHeaderSearchFilter: Session.get('messageHeaderSearchFilter'),
      fhirVersion: Session.get('fhirVersion'),
      selectedMessageHeaderId: Session.get("selectedMessageHeaderId"),
      selectedMessageHeader: Session.get("selectedMessageHeader"),
      selected: [],
      messageHeaders: [],
      query: {},
      options: {
        limit: get(Meteor, 'settings.public.defaults.paginationLimit', 5)
      },
      tabIndex: Session.get('messageHeaderPageTabIndex'),
      onePageLayout: true
    };

    data.onePageLayout = Session.get('MessageHeadersPage.onePageLayout');

    console.log('MessageHeadersPage.data.query', data.query)
    console.log('MessageHeadersPage.data.options', data.options)

    data.messageHeaders = MessageHeaders.find(data.query, data.options).fetch();
    data.messageHeadersCount = MessageHeaders.find(data.query, data.options).count();

    // console.log("MessageHeadersPage[data]", data);
    return data;
  }

  // this could be a mixin
  handleTabChange(index){
    Session.set('messageHeaderPageTabIndex', index);
  }
  handleActive(index){
  }
  onCancelUpsertMessageHeader(context){
    Session.set('messageHeaderPageTabIndex', 1);
  }
  onDeleteMessageHeader(context){
    MessageHeaders._collection.remove({_id: get(context, 'state.messageHeaderId')}, function(error, result){
      if (error) {
        if(process.env.NODE_ENV === "test") console.log('MessageHeaders.insert[error]', error);
        Bert.alert(error.reason, 'danger');
      }
      if (result) {
        Session.set('selectedMessageHeaderId', '');
        HipaaLogger.logEvent({eventType: "delete", userId: Meteor.userId(), userName: Meteor.user().fullName(), collectionName: "MessageHeaders", recordId: context.state.messageHeaderId});
        Bert.alert('MessageHeader removed!', 'success');
      }
    });
    Session.set('messageHeaderPageTabIndex', 1);
  }
  onUpsertMessageHeader(context){
    console.log('Saving a new MessageHeader...', context.state)

    if(get(context, 'state.messageHeader')){
      let self = context;
      let fhirMessageHeaderData = Object.assign({}, get(context, 'state.messageHeader'));
  
      let messageHeaderValidator = MessageHeaderSchema.newContext();
  
      messageHeaderValidator.validate(fhirMessageHeaderData)
  
      if(process.env.NODE_ENV === "development"){
        console.log('IsValid: ', messageHeaderValidator.isValid())
        console.log('ValidationErrors: ', messageHeaderValidator.validationErrors());
  
      }
  
      console.log('Checking context.state again...', context.state)
      if (get(context, 'state.messageHeaderId')) {
        if(process.env.NODE_ENV === "development") {
          console.log("Updating messageHeader...");
        }

        delete fhirMessageHeaderData._id;
  
        // not sure why we're having to respecify this; fix for a bug elsewhere
        fhirMessageHeaderData.resourceType = 'MessageHeader';
  
        MessageHeaders._collection.update({_id: get(context, 'state.messageHeaderId')}, {$set: fhirMessageHeaderData }, function(error, result){
          if (error) {
            if(process.env.NODE_ENV === "test") console.log("MessageHeaders.insert[error]", error);
            Bert.alert(error.reason, 'danger');
          }
          if (result) {
            HipaaLogger.logEvent({eventType: "update", userId: Meteor.userId(), userName: Meteor.user().fullName(), collectionName: "MessageHeaders", recordId: context.state.messageHeaderId});
            Session.set('selectedMessageHeaderId', '');
            Session.set('messageHeaderPageTabIndex', 1);
            Bert.alert('MessageHeader added!', 'success');
          }
        });
      } else {
        // if(process.env.NODE_ENV === "test") 
        console.log("Creating a new messageHeader...", fhirMessageHeaderData);
  
        fhirMessageHeaderData.effectiveDateTime = new Date();
        MessageHeaders._collection.insert(fhirMessageHeaderData, function(error, result) {
          if (error) {
            if(process.env.NODE_ENV === "test")  console.log('MessageHeaders.insert[error]', error);
            Bert.alert(error.reason, 'danger');
          }
          if (result) {
            HipaaLogger.logEvent({eventType: "create", userId: Meteor.userId(), userName: Meteor.user().fullName(), collectionName: "MessageHeaders", recordId: context.state.messageHeaderId});
            Session.set('messageHeaderPageTabIndex', 1);
            Session.set('selectedMessageHeaderId', '');
            Bert.alert('MessageHeader added!', 'success');
          }
        });
      }
    } 
    Session.set('messageHeaderPageTabIndex', 1);
  }
  handleRowClick(messageHeaderId, foo, bar){
    console.log('MessageHeadersPage.handleRowClick', messageHeaderId)
    let messageHeader = MessageHeaders.findOne({id: messageHeaderId});

    Session.set('selectedMessageHeaderId', get(messageHeader, 'id'));
    Session.set('selectedMessageHeader', messageHeader);
  }
  onTableCellClick(id){
    Session.set('messageHeadersUpsert', false);
    Session.set('selectedMessageHeaderId', id);
    Session.set('messageHeaderPageTabIndex', 2);
  }
  tableActionButtonClick(_id){
    let messageHeader = MessageHeaders.findOne({_id: _id});

    // console.log("MessageHeadersTable.onSend()", messageHeader);

    var httpEndpoint = "http://localhost:8080";
    if (get(Meteor, 'settings.public.interfaces.default.channel.endpoint')) {
      httpEndpoint = get(Meteor, 'settings.public.interfaces.default.channel.endpoint');
    }
    HTTP.post(httpEndpoint + '/MessageHeader', {
      data: messageHeader
    }, function(error, result){
      if (error) {
        console.log("error", error);
      }
      if (result) {
        console.log("result", result);
      }
    });
  }
  onInsert(messageHeaderId){
    Session.set('selectedMessageHeaderId', '');
    Session.set('messageHeaderPageTabIndex', 1);
    HipaaLogger.logEvent({eventType: "create", userId: Meteor.userId(), userName: Meteor.user().fullName(), collectionName: "MessageHeaders", recordId: messageHeaderId});
  }
  onUpdate(messageHeaderId){
    Session.set('selectedMessageHeaderId', '');
    Session.set('messageHeaderPageTabIndex', 1);
    HipaaLogger.logEvent({eventType: "update", userId: Meteor.userId(), userName: Meteor.user().fullName(), collectionName: "MessageHeaders", recordId: messageHeaderId});
  }
  onRemove(messageHeaderId){
    Session.set('messageHeaderPageTabIndex', 1);
    Session.set('selectedMessageHeaderId', '');
    HipaaLogger.logEvent({eventType: "delete", userId: Meteor.userId(), userName: Meteor.user().fullName(), collectionName: "MessageHeaders", recordId: messageHeaderId});
  }
  onCancel(){
    Session.set('messageHeaderPageTabIndex', 1);
  } 
  render() {
    // console.log('MessageHeadersPage.data', this.data)

    function handleChange(event, newValue) {
      Session.set('messageHeaderPageTabIndex', newValue)
    }

    let headerHeight = LayoutHelpers.calcHeaderHeight();

    let layoutContents;
    if(this.data.onePageLayout){
      layoutContents = <StyledCard height="auto" margin={20} >
        <CardHeader title={this.data.messageHeadersCount + " MessageHeaders"} />
        <CardContent>

          <MessageHeadersTable 
            messageHeaders={ this.data.messageHeaders }
            hideCheckbox={true} 
            hideActionIcons={true}
            hideIdentifier={true} 
            hideTitle={false} 
            hideDescription={false} 
            hideApprovalDate={false}
            hideLastReviewed={false}
            hideVersion={false}
            hideStatus={false}
            hideAuthor={true}
            hidePublisher={false}
            hideReviewer={false}
            hideEditor={false}
            hideEndorser={false}
            hideType={false}
            hideRiskAdjustment={true}
            hideRateAggregation={true}
            hideScoring={false}
            paginationLimit={10}     
            />
          </CardContent>
        </StyledCard>
    } else {
      layoutContents = <Grid container spacing={3}>
        <Grid item lg={6}>
          <StyledCard height="auto" margin={20} >
            <CardHeader title={this.data.messageHeadersCount + " MessageHeaders"} />
            <CardContent>
              <MessageHeadersTable 
                messageHeaders={ this.data.messageHeaders }
                selectedMessageHeaderId={ this.data.selectedMessageHeaderId }
                hideIdentifier={true} 
                hideCheckbox={true} 
                hideApprovalDate={false}
                hideLastReviewed={false}
                hideVersion={false}
                hideStatus={false}
                hidePublisher={true}
                hideReviewer={true}
                hideScoring={true}
                hideEndorser={true}
                paginationLimit={10}            
                hideActionIcons={true}
                onRowClick={this.handleRowClick.bind(this) }
                count={this.data.messageHeadersCount}
                />
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item lg={4}>
          <StyledCard height="auto" margin={20} scrollable>
            <h1 className="barcode" style={{fontWeight: 100}}>{this.data.selectedMessageHeaderId }</h1>
            {/* <CardHeader title={this.data.selectedMessageHeaderId } className="helveticas barcode" /> */}
            <CardContent>
              <CardContent>
                <MessageHeaderDetail 
                  id='messageHeaderDetails' 
                  displayDatePicker={true} 
                  displayBarcodes={false}
                  messageHeader={ this.data.selectedMessageHeader }
                  messageHeaderId={ this.data.selectedMessageHeaderId } 
                  showMessageHeaderInputs={true}
                  showHints={false}
                  // onInsert={ this.onInsert }
                  // onDelete={ this.onDeleteMessageHeader }
                  // onUpsert={ this.onUpsertMessageHeader }
                  // onCancel={ this.onCancelUpsertMessageHeader } 
                />
              </CardContent>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    }

    return (
      <PageCanvas id="messageHeadersPage" headerHeight={headerHeight}>
        <MuiThemeProvider theme={muiTheme} >
          { layoutContents }
        </MuiThemeProvider>
      </PageCanvas>
    );
  }
}

ReactMixin(MessageHeadersPage.prototype, ReactMeteorData);
export default MessageHeadersPage;