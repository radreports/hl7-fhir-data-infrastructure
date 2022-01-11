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
import { useTracker } from 'meteor/react-meteor-data';

import OrganizationAffiliationDetail from './OrganizationAffiliationDetail';
import OrganizationAffiliationsTable from './OrganizationAffiliationsTable';
import LayoutHelpers from '../../lib/LayoutHelpers';

import { StyledCard, PageCanvas } from 'fhir-starter';

import { get, cloneDeep } from 'lodash';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
// import { OrganizationAffiliations } from '../../lib/schemas/OrganizationAffiliations';


//---------------------------------------------------------------
// Session Variables


Session.setDefault('organizationAffiliationPageTabIndex', 0);
Session.setDefault('organizationAffiliationSearchFilter', '');
Session.setDefault('selectedOrganizationAffiliationId', '');
Session.setDefault('selectedOrganizationAffiliation', false);
Session.setDefault('fhirVersion', 'v1.0.2');
Session.setDefault('organizationAffiliationsArray', []);
Session.setDefault('OrganizationAffiliationsPage.onePageLayout', true)
Session.setDefault('OrganizationAffiliationsTable.hideCheckbox', true)

//---------------------------------------------------------------
// Theming

const muiTheme = Theming.createMuiTheme();



//===========================================================================
// MAIN COMPONENT  

Session.setDefault('organizationAffiliationChecklistMode', false)

export function OrganizationAffiliationsPage(props){

  let headerHeight = LayoutHelpers.calcHeaderHeight();
  let formFactor = LayoutHelpers.determineFormFactor();
  let paddingWidth = LayoutHelpers.calcCanvasPaddingWidth();


  let data = {
    selectedAuditEventId: '',
    selectedAuditEvent: null,
    organizationAffiliations: [],
    onePageLayout: true,
    organizationAffiliationSearchFilter: '',
    options: {
      sort: {
        'focus.display': -1,
        lastModified: -1
      }
    },
    organizationAffiliationChecklistMode: false
  };

  


  data.onePageLayout = useTracker(function(){
    return Session.get('OrganizationAffiliationsPage.onePageLayout');
  }, [])
  data.hideCheckbox = useTracker(function(){
    return Session.get('OrganizationAffiliationsTable.hideCheckbox');
  }, [])
  data.selectedOrganizationAffiliationId = useTracker(function(){
    return Session.get('selectedOrganizationAffiliationId');
  }, [])
  data.selectedOrganizationAffiliation = useTracker(function(){
    return AuditEvents.findOne(Session.get('selectedOrganizationAffiliationId'));
  }, [])
  data.organizationAffiliations = useTracker(function(){
    let results = [];
    if(Session.get('organizationAffiliationChecklistMode')){
      results = OrganizationAffiliations.find({
        'focus.display': "Patient Correction"
      }, {
        limit: 10,
        sort: {lastModified: -1}
      }).fetch();      
    } else {
      results = OrganizationAffiliations.find().fetch();
    }

    return results;
  }, [])
  data.organizationAffiliationSearchFilter = useTracker(function(){
    return Session.get('organizationAffiliationSearchFilter')
  }, [])
  data.organizationAffiliationChecklistMode = useTracker(function(){
    return Session.get('organizationAffiliationChecklistMode')
  }, [])


  function onCancelUpsertOrganizationAffiliation(context){
    Session.set('organizationAffiliationPageTabIndex', 1);
  }
  function onDeleteOrganizationAffiliation(context){
    OrganizationAffiliations._collection.remove({_id: get(context, 'state.organizationAffiliationId')}, function(error, result){
      if (error) {
        if(process.env.NODE_ENV === "test") console.log('OrganizationAffiliations.insert[error]', error);
        Bert.alert(error.reason, 'danger');
      }
      if (result) {
        Session.set('selectedOrganizationAffiliationId', '');
        HipaaLogger.logEvent({eventType: "delete", userId: Meteor.userId(), userName: Meteor.user().fullName(), collectionName: "OrganizationAffiliations", recordId: context.state.organizationAffiliationId});        
      }
    });
    Session.set('organizationAffiliationPageTabIndex', 1);
  }
  function onUpsertOrganizationAffiliation(context){
    //if(process.env.NODE_ENV === "test") console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^&&')
    console.log('Saving a new OrganizationAffiliation...', context.state)

    if(get(context, 'state.organizationAffiliation')){
      let self = context;
      let fhirOrganizationAffiliationData = Object.assign({}, get(context, 'state.organizationAffiliation'));
  
      // if(process.env.NODE_ENV === "test") console.log('fhirOrganizationAffiliationData', fhirOrganizationAffiliationData);
  
      let organizationAffiliationValidator = OrganizationAffiliationSchema.newContext();
      // console.log('organizationAffiliationValidator', organizationAffiliationValidator)
      organizationAffiliationValidator.validate(fhirOrganizationAffiliationData)
  
      if(process.env.NODE_ENV === "development"){
        console.log('IsValid: ', organizationAffiliationValidator.isValid())
        console.log('ValidationErrors: ', organizationAffiliationValidator.validationErrors());
  
      }
  
      console.log('Checking context.state again...', context.state)
      if (get(context, 'state.organizationAffiliationId')) {
        if(process.env.NODE_ENV === "development") {
          console.log("Updating organizationAffiliation...");
        }

        delete fhirOrganizationAffiliationData._id;
  
        // not sure why we're having to respecify this; fix for a bug elsewhere
        fhirOrganizationAffiliationData.resourceType = 'OrganizationAffiliation';
  
        OrganizationAffiliations._collection.update({_id: get(context, 'state.organizationAffiliationId')}, {$set: fhirOrganizationAffiliationData }, function(error, result){
          if (error) {
            if(process.env.NODE_ENV === "test") console.log("OrganizationAffiliations.insert[error]", error);
          
          }
          if (result) {
            HipaaLogger.logEvent({eventType: "update", userId: Meteor.userId(), userName: Meteor.user().fullName(), collectionName: "OrganizationAffiliations", recordId: context.state.organizationAffiliationId});
            Session.set('selectedOrganizationAffiliationId', '');
            Session.set('organizationAffiliationPageTabIndex', 1);
          }
        });
      } else {
        // if(process.env.NODE_ENV === "test") 
        console.log("Creating a new organizationAffiliation...", fhirOrganizationAffiliationData);
  
        fhirOrganizationAffiliationData.effectiveDateTime = new Date();
        OrganizationAffiliations._collection.insert(fhirOrganizationAffiliationData, function(error, result) {
          if (error) {
            if(process.env.NODE_ENV === "test")  console.log('OrganizationAffiliations.insert[error]', error);           
          }
          if (result) {
            HipaaLogger.logEvent({eventType: "create", userId: Meteor.userId(), userName: Meteor.user().fullName(), collectionName: "OrganizationAffiliations", recordId: context.state.organizationAffiliationId});
            Session.set('organizationAffiliationPageTabIndex', 1);
            Session.set('selectedOrganizationAffiliationId', '');
          }
        });
      }
    } 
    Session.set('organizationAffiliationPageTabIndex', 1);
  }
  function handleRowClick(orgAffiliationId){
    console.log('OrganizationAffiliationsPage.handleRowClick', orgAffiliationId)
    let orgAffiliation = OrganizationAffiliations.findOne({id: orgAffiliationId});

    if(orgAffiliation){
      Session.set('selectedOrganizationAffiliationId', get(orgAffiliation, 'id'));
      Session.set('selectedOrganizationAffiliation', orgAffiliation);
      Session.set('OrganizationAffiliation.Current', orgAffiliation);
      
      let showModals = true;
      if(showModals){
        Session.set('mainAppDialogOpen', true);
        Session.set('mainAppDialogComponent', "OrganizationAffiliationDetail");
        Session.set('mainAppDialogMaxWidth', "sm");

        if(Meteor.currentUserId()){
          Session.set('mainAppDialogTitle', "Edit Affiliation");
        } else {
          Session.set('mainAppDialogTitle', "View Affiliation");
        }
      }      
    } else {
      console.log('No OrgAffiliation found...')
    }
  }
  function onInsert(organizationAffiliationId){
    Session.set('selectedOrganizationAffiliationId', '');
    Session.set('organizationAffiliationPageTabIndex', 1);
    HipaaLogger.logEvent({eventType: "create", userId: Meteor.userId(), userName: Meteor.user().fullName(), collectionName: "OrganizationAffiliations", recordId: organizationAffiliationId});
  }
  function onCancel(){
    Session.set('organizationAffiliationPageTabIndex', 1);
  } 


  // console.log('OrganizationAffiliationsPage.data', data)

  function handleChange(event, newValue) {
    Session.set('organizationAffiliationPageTabIndex', newValue)
  }


  let layoutContents;
  if(data.onePageLayout){
    layoutContents = <StyledCard height="auto" margin={20} scrollable >
      <CardHeader title={data.organizationAffiliations.length + " Organization Affiliations"} />
      <CardContent>

        <OrganizationAffiliationsTable 
          organizationAffiliations={ data.organizationAffiliations }
          hideCheckbox={data.hideCheckbox}
          hideStatus={false}
          hideName={false}
          hideTitle={false}
          hideVersion={false}
          hideExperimental={false}
          paginationLimit={10}     
          checklist={data.organizationAffiliationChecklistMode}
          onRowClick={ handleRowClick.bind(this) }
          rowsPerPage={ LayoutHelpers.calcTableRows("medium",  props.appHeight) }
          formFactorLayout={formFactor}
          count={data.organizationAffiliations.length}
          />
        </CardContent>
      </StyledCard>
  } else {
    layoutContents = <Grid container spacing={3}>
      <Grid item lg={6}>
        <StyledCard height="auto" margin={20} >
          <CardHeader title={data.organizationAffiliations.length + " Organization Affiliations"} />
          <CardContent>
            <OrganizationAffiliationsTable 
              organizationAffiliations={ data.organizationAffiliations }
              selectedOrganizationAffiliationId={ data.selectedOrganizationAffiliationId }
              hideIdentifier={true} 
              hideCheckbox={data.hideCheckbox}
              hideActionIcons={true}
              hideStatus={false}
              hideName={false}
              hideTitle={false}
              hideVersion={false}
              hideExperimental={false}    
              hideBarcode={true}
              onRowClick={ handleRowClick.bind(this) }
              rowsPerPage={ LayoutHelpers.calcTableRows("medium",  props.appHeight) }
              formFactorLayout={formFactor}
              count={data.organizationAffiliations.length}
              />
          </CardContent>
        </StyledCard>
      </Grid>
      <Grid item lg={4}>
        <StyledCard height="auto" margin={20} scrollable>
          <h1 className="barcode" style={{fontWeight: 100}}>{data.selectedOrganizationAffiliationId }</h1>
          {/* <CardHeader title={data.selectedOrganizationAffiliationId } className="helveticas barcode" /> */}
          <CardContent>
            <CardContent>
              <OrganizationAffiliationDetail 
                id='organizationAffiliationDetails'                 
                displayDatePicker={true} 
                displayBarcodes={false}
                organizationAffiliation={ data.selectedOrganizationAffiliation }
                organizationAffiliationId={ data.selectedOrganizationAffiliationId } 
                showOrganizationAffiliationInputs={true}
                showHints={false}

              />
            </CardContent>
          </CardContent>
        </StyledCard>
      </Grid>
    </Grid>
  }

  return (
    <PageCanvas id="organizationAffiliationsPage" headerHeight={headerHeight} paddingLeft={paddingWidth} paddingRight={paddingWidth}>
      <MuiThemeProvider theme={muiTheme} >
        { layoutContents }
      </MuiThemeProvider>
    </PageCanvas>
  );
}


export default OrganizationAffiliationsPage;