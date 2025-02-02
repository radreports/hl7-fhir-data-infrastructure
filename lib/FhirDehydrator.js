import _ from 'lodash';
let get = _.get;
let set = _.set;
let has = _.has;
let findIndex = _.findIndex;

import moment from 'moment';
import FhirUtilities from './FhirUtilities';
  
//========================================================================================
// Helper Functions  

function determineSubjectDisplayString(resourceRecord){
  let subjectDisplayString = '';
  if(get(resourceRecord, 'subject')){
    if(get(resourceRecord, 'subject.display', '')){
      subjectDisplayString = get(resourceRecord, 'subject.display', '');
    } else {
      subjectDisplayString = get(resourceRecord, 'subject.reference', '');
    }
  }  
  if(get(resourceRecord, 'patient')){
    if(get(resourceRecord, 'patient.display', '')){
      subjectDisplayString = get(resourceRecord, 'patient.display', '');
    } else {
      subjectDisplayString = get(resourceRecord, 'patient.reference', '');
    }
  }  
  return subjectDisplayString;
}

//========================================================================================
// Flatten Algorithm Template


export function flattenExample(example, internalDateFormat){
    let result = {
      resourceType: 'Example',
      _id: '',
      id: '',
      identifier: '',
      status: '',
      date: ''
    };
    result.resourceType = get(example, 'resourceType', "Unknown");
  
    if(!internalDateFormat){
        internalDateFormat = get(Meteor, "settings.public.defaults.internalDateFormat", "YYYY-MM-DD");
      }
    
    result._id = get(example, '_id');
    result.id = get(example, 'id');
    result.identifier = get(example, 'identifier[0].value');
    result.status = get(example, 'status');
    result.date = moment(get(example, 'status')).format(internalDateFormat);

    return result;
}


//========================================================================================
// Flatten Algorithms

export function flattenAllergyIntolerance(allergy){
  let result = {
    patientDisplay: '',
    asserterDisplay: '',
    identifier: '',
    type: '',
    category: '',
    clinicalStatus: '',
    verificationStatus: '',
    snomedCode: '',
    snomedDisplay: '',
    evidenceDisplay: '',
    barcode: '',
    criticality: '',
    severity: '',
    patient: '',
    recorder: '', 
    reaction: '',
    substance: '',
    onset: '',
    recordedDate: '',
    operationOutcome: ''
  };
  result.resourceType = get(allergy, 'resourceType', "Unknown");

  result.identifier = get(allergy, 'identifier[0].value');
  result.clinicalStatus = get(allergy, 'clinicalStatus');
  result.verificationStatus = get(allergy, 'verificationStatus');
  result.type = get(allergy, 'type');
  result.category = get(allergy, 'category[0]');

  if(has(allergy, 'substance.coding[0].display')){
    result.substance = get(allergy, 'substance.coding[0].display');
  } else {
    result.substance = get(allergy, 'substance.text');
  }

  if(get(allergy, 'code.coding[0]')){            
    result.snomedCode = get(allergy, 'code.coding[0].code');
    result.snomedDisplay = get(allergy, 'code.coding[0].display');
  }

  // DSTU2 v1.0.2
  result.patient = get(allergy, 'patient.display');
  result.recorder = get(allergy, 'recorder.display');
  result.reaction = get(allergy, 'reaction[0].description', '');
  result.onset = moment(get(allergy, 'reaction[0].onset')).format("YYYY-MM-DD");
  result.recordedDate = moment(get(allergy, 'recordedDate')).format("YYYY-MM-DD");

  // DSTU v4
  if(get(allergy, 'onsetDateTime')){
    result.onset = moment(get(allergy, 'onsetDateTime')).format("YYYY-MM-DD");
  }
  if(get(allergy, 'reaction[0].manifestation[0].text')){
    result.reaction = get(allergy, 'reaction[0].manifestation[0].text', '');
  }
  if(get(allergy, 'reaction[0].severity')){
    result.reaction = get(allergy, 'reaction[0].severity', '');
  }

  if(get(allergy, 'criticality')){
    switch (get(allergy, 'criticality')) {
      case "CRITL":
        result.criticality = 'Low Risk';         
        break;
      case "CRITH":
        result.criticality = 'High Risk';         
        break;
      case "CRITU":
        result.criticality = 'Unable to determine';         
        break;        
      default:
        result.criticality = get(allergy, 'criticality');    
      break;
    }
  };

  if(get(allergy, "issue[0].details.text")){
    result.operationOutcome = get(allergy, "issue[0].details.text");
  }

  return result;
}

export function flattenAuditEvent(auditEvent){
  let result = {
    _id: auditEvent._id,
    id: auditEvent.id,

    categoryDisplay: '',
    categoryCode: '',

    codeDisplay: '',
    codeCode: '',

    severity: 'routine',

    action: '',
    outcome: '',
    outcomeDesc: '',

    occurredPeriod: '',
    occurredDateTime: '',

    recorded: '',

    outcomeCode: '',
    outcomeDisplay: '',
    outcomeDetail: '',

    authorizationCode: '',
    authorizationDisplay: '',

    baseOnDisplay: '',
    baseOnReference: '',

    patientDisplay: '',
    patientReference: '',

    encounterDisplay: '',
    encounterReference: '',

    agentTypeText: '',
    agentRoleText: '',
    agentWhoDisplay: '',
    agentWhoReference: '',

    
    sourceSiteDisplay: '',
    sourceSiteReference: '',
    sourceObserverDisplay: '',
    sourceObserverReference: '',
    sourceTypeText: '',

    entityWhatDisplay: '',
    entityRoleText: '',
    entitySecurityLabel: '',

  };



  result.severity = get(auditEvent, 'severity', "routine");

  result.categoryDisplay = get(auditEvent, 'category[0].coding[0].display', "");
  result.categoryCode = get(auditEvent, 'category[0].coding[0].display', "");

  result.codeDisplay = get(auditEvent, 'code.coding[0].display', "");
  result.codeCode = get(auditEvent, 'code.coding[0].code', "");

  result.action = get(auditEvent, 'action', "");
  // result.outcome = get(auditEvent, '', "");
  // result.outcomeDesc = get(auditEvent, '', "");

  result.occurredPeriodStart = moment(get(auditEvent, 'occurredPeriod.start')).format("YYYY-MM-DD");
  result.occurredPeriodEnd = moment(get(auditEvent, 'occurredPeriod.end')).format("YYYY-MM-DD");
  result.occurredDateTime = moment(auditEvent.occurredDateTime).format("YYYY-MM-DD");

  result.recorded = moment(auditEvent.recorded).format("YYYY-MM-DD");

  result.outcomeCode = get(auditEvent, 'outcome[0].code.code', "");
  // result.outcomeDisplay = get(auditEvent, 'outcome.code', "");
  result.outcomeDetail = get(auditEvent, 'outcome.detail[0].text', "");

  result.authorizationCode = get(auditEvent, 'authorization[0].coding[0].code', "");
  result.authorizationDisplay = get(auditEvent, 'authorization[0].coding[0].display', "");

  result.baseOnDisplay = get(auditEvent, 'basedOn[0].display', "");
  result.baseOnReference = get(auditEvent, 'basedOn[0].reference', "");

  result.patientDisplay = get(auditEvent, 'patient[0].display', "");
  result.patientReference = get(auditEvent, 'patient[0].reference', "");

  result.encounterDisplay = get(auditEvent, 'encounter[0].display', "");
  result.encounterReference = get(auditEvent, 'encounter[0].reference', "");

  result.agentTypeText = get(auditEvent, 'agent[0].type.text', "");
  result.agentRoleText = get(auditEvent, 'agent[0].role.text', "");
  result.agentWhoDisplay = get(auditEvent, 'agent[0].who.display', "");
  result.agentWhoReference = get(auditEvent, 'agent[0].who.reference', "");

  result.sourceSiteDisplay = get(auditEvent, 'source.site.display', "");
  result.sourceSiteReference = get(auditEvent, 'source.site.reference', "");
  result.sourceObserverDisplay = get(auditEvent, 'source.observer.display', "");
  result.sourceObserverReference = get(auditEvent, 'source.observer.reference', "");
  result.sourceTypeText = get(auditEvent, 'source[0].type.text', "");

  result.entityWhatDisplay = get(auditEvent, 'entity[0].what.display', "");
  result.entityRoleText = get(auditEvent, 'entity[0].role.text', "");
  result.entitySecurityLabel = get(auditEvent, 'entity[0].securityLabel[0].text', "");
  

  // result.resourceType = get(auditEvent, 'resourceType', "Unknown");

  // result.categoryDisplay = get(auditEvent, 'category.text', '');
  // result.categoryCode = get(auditEvent, 'category[0].coding[0].code', '');

  // result.codeDisplay = get(auditEvent, 'code[0].text', '');
  // result.codeCode = get(auditEvent, 'code[0].coding[0].code', '');

  // result.severity = get(auditEvent, 'severity', '');

  // result.action = get(auditEvent, 'action', '');
  // result.outcome = get(auditEvent, 'outcome', '');
  // // result.outcomeDesc = get(auditEvent, 'outcomeDesc', '');

  // result.agentName = get(auditEvent, 'agent[0].name', '');
  // result.sourceSite = get(auditEvent, 'source[0].site', '');
  // result.entityName = get(auditEvent, 'entity[0].name', '');

  // there's an off-by-1 error between momment() and Date() that we want
  // to account for when converting back to a string
  // result.recorded = moment(auditEvent.recorded).format("YYYY-MM-DD");

  if(get(auditEvent, "issue[0].details.text")){
    result.operationOutcome = get(auditEvent, "issue[0].details.text");
  }

  return result;
}

export function flattenBundle(bundle){
  let result = {
    _id: bundle._id,
    id: bundle.id,
    active: true,
    type: '',
    links: 0,
    entries: 0,
    total: 0,
    timestamp: '',
    operationOutcome: ''
  };

  result.resourceType = get(bundle, 'resourceType', "Unknown");

  result.type = get(bundle, 'type', '');
  if(Array.isArray(bundle.links)){
    result.links = bundle.links.length;
  }
  if(Array.isArray(bundle.entry)){
    result.entries = bundle.entry.length;
  }
  result.total = get(bundle, 'total', 0);

  // there's an off-by-1 error between momment() and Date() that we want
  // to account for when converting back to a string
  result.timestamp = moment(bundle.timestamp).format("YYYY-MM-DD hh:mm:ss");

  if(get(bundle, "issue[0].details.text")){
    result.operationOutcome = get(bundle, "issue[0].details.text");
  }

  return result;
}

export function flattenCarePlan(plan){
  // careplans: CarePlans.find({'subject.reference': Meteor.userId}).map(function(plan){
  // todo: replace tertiary logic

  // console.log('flattenCarePlan', plan)

  let result = {
    _id: '',
    id: '',
    subject: '',
    author: '',
    template: '',
    category: '',
    am: '',
    pm: '',
    activities: 0,
    goals: 0,
    addresses: 0,
    start: '',
    end: '',
    title: '',
    identifier: '',
    status: '',
    operationOutcome: ''
  };

  result.resourceType = get(plan, 'resourceType', "Unknown");

  result.id = get(plan, 'id', '');
  result._id = get(plan, '_id', '');

  if (get(plan, 'template')) {
    result.template = plan.template.toString();
  }

  result.subject = determineSubjectDisplayString(plan);

  result.author = get(plan, 'author.display', '')
  result.start = moment(get(plan, 'period.start')).format("YYYY-MM-DD hh:mm a");
  result.end = moment(get(plan, 'period.start')).format("YYYY-MM-DD hh:mm a");
  result.category = get(plan, 'category[0].text', '')  
  result.status = get(plan, 'status', '')    

  if(Array.isArray(plan.category)){
    plan.category.forEach(function(planCategory){
      if(get(planCategory, 'text')){
        result.category = planCategory.text;
      }
    })
  }

  result.identifier = get(plan, 'identifier[0].value', '')    

  if (get(plan, 'activity')) {
    result.activities = plan.activity.length;
  }
  if (get(plan, 'goal')) {
    result.goals = plan.goal.length;
  }
  if (get(plan, 'addresses')) {
    result.addresses = plan.addresses.length;
  }

  if(!result.title){
    result.title = get(plan, 'title', '')    
  }
  if(!result.title){
    result.title = get(plan, 'description', '')    
  }
  if(!result.title){
    result.title = get(plan, 'category[0].coding[0].display', '')    
  }

  if(get(plan, "issue[0].details.text")){
    result.operationOutcome = get(plan, "issue[0].details.text");
  }

  return result;
}

export function flattenCareTeam(team){

  let result = {
    _id: '',
    id: '',
    identifier: '',
    status: '',
    category: '',
    name: '',
    subject: '',
    periodStart: '',
    periodEnd: '',
    reasonReference: '',
    reasonDisplay: '',
    reasonCode: '',
    participantCount: 0,
    managingOrganization: '',
    telecom: '',
    note: '',
    noteCount: 0,
    operationOutcome: ''
  };

  result.resourceType = get(team, 'resourceType', "Unknown");

  result.id = get(team, 'id', '');
  result._id = get(team, '_id', '');

  result.identifier = get(team, 'identifier[0].value', '')    
  result.status = get(team, 'status', '')    
  result.name = get(team, 'name', '')    
  result.subject = determineSubjectDisplayString(team);
  result.periodStart = moment(get(team, 'period.start')).format("YYYY-MM-DD hh:mm a");
  result.periodEnd = moment(get(team, 'period.start')).format("YYYY-MM-DD hh:mm a");

  result.category = get(team, 'category[0].text', '')  
  if(Array.isArray(team.category)){
    team.category.forEach(function(teamCategory){
      if(get(teamCategory, 'text')){
        result.category = teamCategory.text;
      }
    })
  }

  result.reasonReference = get(team, 'reasonReference[0].reference', '');
  result.reasonDisplay = get(team, 'reasonReference[0].display', '');
  result.reasonCode = get(team, 'reasonCode[0].coding[0].code', '');

  result.managingOrganization = get(team, 'managingOrganization[0].display', '');

  if(Array.isArray(team.participant)){
    result.participantCount = team.participant.length;
  }
  if(Array.isArray(team.note)){
    result.noteCount = team.note.length;
  }

  if(get(team, "issue[0].details.text")){
    result.operationOutcome = get(team, "issue[0].details.text");
  }

  return result;
}

export function flattenComposition(composition){
  let result = {
    _id: '',
    id: '',
    meta: '',
    identifier: '',
    status: '',
    typeCode: '',
    typeDisplay: '',
    categoryDisplay: '',
    subject: '',
    subjectReference: '',
    encounter: '',
    encounterReference: '',
    author: '',
    authorReference: '',
    relatesToCode: '',
    relatesToIdentifier: '',
    relatesToDisplay: '',
    relatesToReference: '',
    date: '',
    sectionsCount: 0,
    operationOutcome: ''
  };

  result.resourceType = get(composition, 'resourceType', "Unknown");

  result.id = get(composition, 'id', '');
  result._id = get(composition, '_id', '');

  result.identifier = get(composition, 'identifier[0].value', '')    
  result.status = get(composition, 'status', '');
  result.date = moment(get(composition, 'date', '')).format("YYYY-MM-DD hh:mm");
  result.typeCode = get(composition, 'type.coding[0].code', '');
  result.typeDisplay = get(composition, 'type.coding[0].display', '');
  result.categoryDisplay = get(composition, 'category[0].text', '');


  if(has(composition, 'subject')){
    result.subject = get(composition, 'subject.display', '');
  } else {
    result.subject = get(composition, 'subject.reference', '');
  }
  result.subjectReference = get(composition, 'subject.reference', '');

  if(has(composition, 'encounter')){
    result.encounter = get(composition, 'encounter.display', '');
  } else {
    result.encounter = get(composition, 'encounter.reference', '');
  }
  result.encounterReference = get(composition, 'encounter.reference', '');

  if(has(composition, 'author')){
    result.author = get(composition, 'author.display', '');
  } else {
    result.author = get(composition, 'author.reference', '');
  }
  result.authorReference = get(composition, 'author.reference', '');


  result.relatesToCode = get(composition, 'relatesTo[0].code', '');
  result.relatesToIdentifier = get(composition, 'relatesTo[0].targetIdentifier.value', '');
  result.relatesToDisplay = get(composition, 'relatesTo[0].targetReference.display', '');
  result.relatesToReference = get(composition, 'relatesTo[0].targetReference.reference', '');
  
  let sectionArray = get(composition, 'section', []);
  if(Array.isArray(sectionArray)){
    result.sectionsCount = sectionArray.length;
  }

  if(get(composition, "issue[0].details.text")){
    result.operationOutcome = get(composition, "issue[0].details.text");
  }

  return result;
}

export function flattenCodeSystem(codeSystem, internalDateFormat){
  let result = {
    _id: '',
    id: '',
    meta: '',
    url: '',
    version: '',
    name: '',
    status: '',
    experimental: '',
    date: '',
    publisher: '',
    description: '',
    useContext: '',
    jurisdiction: '',
    code: '',
    base: '',
    type: '',
    expression: '',
    xpath: '',
    xpathUsage: '',
    target: '',
    multipleOr: '',
    multipleAnd: '',
    comparator: '',
    modifier: '',
    chain: '',
  };

  result.resourceType = get(codeSystem, 'resourceType', "Unknown");

  if(!internalDateFormat){
    internalDateFormat = get(Meteor, "settings.public.defaults.internalDateFormat", "YYYY-MM-DD");
  }

  result._id =  get(codeSystem, 'id') ? get(codeSystem, 'id') : get(codeSystem, '_id');
  result.id = get(codeSystem, 'id', '');
  result.identifier = get(codeSystem, 'identifier[0].value', '');
 
  result.version = get(codeSystem, 'version', '');
  result.name = get(codeSystem, 'name', '');
  result.title = get(codeSystem, 'title', '');
  result.status = get(codeSystem, 'status', '');
  result.experimental = get(codeSystem, 'experimental', false);
  result.date = moment(get(codeSystem, 'date', '')).format("YYYY-MM-DD");
  result.publisher = get(codeSystem, 'publisher', '');

  result.contact = get(codeSystem, 'contact[0].name', '');
  result.description = get(codeSystem, 'description', '');
  result.purpose = get(codeSystem, 'purpose', '');
  result.copyright = get(codeSystem, 'copyright', '');
  result.caseSensitive = get(codeSystem, 'caseSensitive', false);

  result.valueset = get(codeSystem, 'valueset', '');
  result.hierarchyMeaning = get(codeSystem, 'hierarchyMeaning', '');

  result.compositional = get(codeSystem, 'compositional', false);
  result.versionNeeded = get(codeSystem, 'versionNeeded', false);

  result.content = get(codeSystem, 'content', '');
  result.supplements = get(codeSystem, 'supplements', '');

  
  return result;
}

export function flattenCondition(condition, internalDateFormat){
  let result = {
    _id: '',
    id: '',
    meta: '',
    identifier: '',
    clinicalStatus: '',
    patientDisplay: '',
    patientReference: '',
    asserterDisplay: '',
    verificationStatus: '',
    severity: '',
    snomedCode: '',
    snomedDisplay: '',
    evidenceDisplay: '',
    barcode: '',
    onsetDateTime: '',
    abatementDateTime: '',
    operationOutcome: ''
  };

  result.resourceType = get(condition, 'resourceType', "Unknown");

  if(!internalDateFormat){
    internalDateFormat = "YYYY-MM-DD";
  }

  result._id = get(condition, '_id', '');
  result.id = get(condition, 'id', '');
  result.identifier = get(condition, 'identifier[0].value', '');

  if(get(condition, 'patient')){
    result.patientDisplay = get(condition, 'patient.display', '');
    result.patientReference = get(condition, 'patient.reference', '');
  } else if (get(condition, 'subject')){
    result.patientDisplay = get(condition, 'subject.display', '');
    result.patientReference = get(condition, 'subject.reference', '');
  }
  result.asserterDisplay = get(condition, 'asserter.display', '');


  if(get(condition, 'clinicalStatus.coding[0].code')){
    result.clinicalStatus = get(condition, 'clinicalStatus.coding[0].code', '');  //R4
  } else {
    result.clinicalStatus = get(condition, 'clinicalStatus', '');                 // DSTU2
  }

  if(get(condition, 'verificationStatus.coding[0].code')){
    result.verificationStatus = get(condition, 'verificationStatus.coding[0].code', '');  // R4
  } else {
    result.verificationStatus = get(condition, 'verificationStatus', '');                 // DSTU2
  }

  result.snomedCode = get(condition, 'code.coding[0].code', '');
  result.snomedDisplay = get(condition, 'code.coding[0].display', '');

  result.evidenceDisplay = get(condition, 'evidence[0].detail[0].display', '');
  result.barcode = get(condition, '_id', '');
  result.severity = get(condition, 'severity.text', '');

  result.onsetDateTime = moment(get(condition, 'onsetDateTime', '')).format("YYYY-MM-DD");
  result.abatementDateTime = moment(get(condition, 'abatementDateTime', '')).format("YYYY-MM-DD");

  console.log('flattenCondition().result', result);

  if(get(condition, "issue[0].details.text")){
    result.operationOutcome = get(condition, "issue[0].details.text");
  }

  return result;
}

export function flattenCommunication(communication, internalDateFormat){
  let result = {
    _id: communication._id,
    subject: '',
    subjectReference: '',
    recipient: '',
    identifier: '',
    telecom: '',
    sent: '',
    received: '',
    category: '',
    payload: '',
    status: '',
    operationOutcome: ''
  };

  result.resourceType = get(communication, 'resourceType', "Unknown");

  if(get(communication, 'sent')){
    result.sent = moment(get(communication, 'sent')).add(1, 'days').format("YYYY-MM-DD hh:mm")
  }
  if(get(communication, 'received')){
    result.received = moment(get(communication, 'received')).add(1, 'days').format("YYYY-MM-DD")
  }

  let telecomString = "";
  let communicationString = "";

  if(typeof get(communication, 'recipient[0].reference') === "string"){
    communicationString = get(communication, 'recipient[0].reference', '');
  } else if(typeof get(communication, 'recipient.reference') === "string"){
    communicationString = get(communication, 'recipient.reference', '');
  }
  
  if(communicationString.split("/")[1]){
    telecomString = communicationString.split("/")[1];
  } else {
    telecomString = communicationString;
  }

  if(telecomString.length > 0){
    result.telecom = telecomString;
  } else {
    result.telecom = get(communication, 'telecom[0].value', '');
  }

  result.subject = get(communication, 'subject.display') ? get(communication, 'subject.display') : get(communication, 'subject.reference')
  result.recipient = get(communication, 'recipient[0].display') ? get(communication, 'recipient[0].display') : get(communication, 'recipient[0].reference')
  result.identifier = get(communication, 'identifier[0].type.text');
  result.category = get(communication, 'category[0].text');
  result.payload = get(communication, 'payload[0].contentString');
  result.status = get(communication, 'status');

  if(get(communication, "issue[0].details.text")){
    result.operationOutcome = get(communication, "issue[0].details.text");
  }

  return result;
}

export function flattenCommunicationRequest(communicationRequest, internalDateFormat){
  let result = {
    _id: communicationRequest._id,
    id: '',
    authoredOn: '',
    subject: '',
    subjectReference: '',
    recipient: '',
    identifier: '',
    telecom: '',
    sent: '',
    received: '',
    category: '',
    payload: '',
    status: '',
    requester: '',
    operationOutcome: ''
  };

  result.resourceType = get(communicationRequest, 'resourceType', "Unknown");

  if(get(communicationRequest, 'sent')){
    result.sent = moment(get(communicationRequest, 'sent')).add(1, 'days').format("YYYY-MM-DD hh:mm")
  }
  if(get(communicationRequest, 'received')){
    result.received = moment(get(communicationRequest, 'received')).add(1, 'days').format("YYYY-MM-DD")
  }

  if(get(communicationRequest, 'authoredOn')){
    result.authoredOn = moment(get(communicationRequest, 'authoredOn')).format("YYYY-MM-DD hh:mm")
  }

  let telecomString = "";
  let communicationRequestString = "";

  if(typeof get(communicationRequest, 'recipient[0].reference') === "string"){
    communicationRequestString = get(communicationRequest, 'recipient[0].reference', '');
  } else if(typeof get(communicationRequest, 'recipient.reference') === "string"){
    communicationRequestString = get(communicationRequest, 'recipient.reference', '');
  }
  
  if(communicationRequestString.split("/")[1]){
    telecomString = communicationRequestString.split("/")[1];
  } else {
    telecomString = communicationRequestString;
  }

  if(telecomString.length > 0){
    result.telecom = telecomString;
  } else {
    result.telecom = get(communicationRequest, 'telecom[0].value', '');
  }

  result.subject = get(communicationRequest, 'subject.display') ? get(communicationRequest, 'subject.display') : get(communicationRequest, 'subject.reference')
  result.recipient = get(communicationRequest, 'recipient[0].display') ? get(communicationRequest, 'recipient[0].display') : get(communicationRequest, 'recipient[0].reference')
  result.identifier = get(communicationRequest, 'identifier[0].value');
  result.payload = get(communicationRequest, 'payload[0].contentString');
  result.status = get(communicationRequest, 'status');
  result.id = get(communicationRequest, 'id');

  result.requester = get(communicationRequest, 'requester.display');


  if(get(communicationRequest, 'category[0].text')){
    result.category = get(communicationRequest, 'category[0].text');
  } else {
    result.category = get(communicationRequest, 'category[0].coding[0].display');
  }


  if(get(communicationRequest, "issue[0].details.text")){
    result.operationOutcome = get(communicationRequest, "issue[0].details.text");
  }

  return result;
}

export function flattenCommunicationResponse(communicationResponse, internalDateFormat){
  let result = {
    _id: communicationResponse._id,
    subject: '',
    subjectReference: '',
    recipient: '',
    identifier: '',
    telecom: '',
    sent: '',
    received: '',
    category: '',
    payload: '',
    status: '',
    operationOutcome: ''
  };

  result.resourceType = get(communicationResponse, 'resourceType', "Unknown");

  if(get(communicationResponse, 'sent')){
    result.sent = moment(get(communicationResponse, 'sent')).add(1, 'days').format("YYYY-MM-DD hh:mm")
  }
  if(get(communicationResponse, 'received')){
    result.received = moment(get(communicationResponse, 'received')).add(1, 'days').format("YYYY-MM-DD")
  }

  let telecomString = "";
  let communicationResponseString = "";

  if(typeof get(communicationResponse, 'recipient[0].reference') === "string"){
    communicationResponseString = get(communicationResponse, 'recipient[0].reference', '');
  } else if(typeof get(communicationResponse, 'recipient.reference') === "string"){
    communicationResponseString = get(communicationResponse, 'recipient.reference', '');
  }
  
  if(communicationResponseString.split("/")[1]){
    telecomString = communicationResponseString.split("/")[1];
  } else {
    telecomString = communicationResponseString;
  }

  if(telecomString.length > 0){
    result.telecom = telecomString;
  } else {
    result.telecom = get(communicationResponse, 'telecom[0].value', '');
  }

  result.subject = get(communicationResponse, 'subject.display') ? get(communicationResponse, 'subject.display') : get(communicationResponse, 'subject.reference')
  result.recipient = get(communicationResponse, 'recipient[0].display') ? get(communicationResponse, 'recipient[0].display') : get(communicationResponse, 'recipient[0].reference')
  result.identifier = get(communicationResponse, 'identifier[0].type.text');
  result.category = get(communicationResponse, 'category[0].text');
  result.payload = get(communicationResponse, 'payload[0].contentString');
  result.status = get(communicationResponse, 'status');

  if(get(communicationResponse, "issue[0].details.text")){
    result.operationOutcome = get(communicationResponse, "issue[0].details.text");
  }

  return result;
}

export function flattenConsent(document){
  let result = {
    _id: document._id,
    id: get(document, 'id', ''),
    dateTime: moment(get(document, 'dateTime', null)).format("YYYY-MM-DD hh:mm:ss"),
    status: get(document, 'status', ''),
    patientReference: get(document, 'patient.reference', ''),
    patientName: get(document, 'patient.display', ''),
    // consentingParty: get(document, 'consentingParty[0].display', ''),
    performer: get(document, 'performer[0].display', ''),
    organization: get(document, 'organization[0].display', ''),
    policyAuthority: get(document, 'policy[0].authority', ''),
    policyUri: get(document, 'policy[0].uri', ''),
    policyRule: get(document, 'policyRule.text', ''),
    provisionType: get(document, 'provision.type', ''),
    provisionAction: get(document, 'provision.action[0].text', ''),
    provisionClass: get(document, 'provision.class', ''),
    provisionActor: get(document, 'provision.actor[0].reference.display', ''),
    start: '',
    end: '',
    sourceReference: get(document, 'sourceReference.reference', ''),
    category: '',
    scope: get(document, 'scope.coding[0].display'),
    operationOutcome: '',
    actorRole: '',
    actorReference: '',
  };

  result.resourceType = get(document, 'resourceType', "Unknown");

  if(has(document, 'patient.display')){
    result.patientName = get(document, 'patient.display')
  } else {
    result.patientName = get(document, 'patient.reference')
  }

  if(has(document, 'category[0].text')){
    result.category = get(document, 'category[0].text')
  } else {
    result.category = get(document, 'category[0].coding[0].display', '')
  }

  if(has(document, 'period.start')){
    result.start = moment(get(document, 'period.start', '')).format("YYYY-MM-DD hh:mm:ss");
  }
  if(has(document, 'period.end')){
    result.end = moment(get(document, 'period.end', '')).format("YYYY-MM-DD hh:mm:ss");
  }

  if(result.patientReference === ''){
    result.patientReference = get(document, 'patient.reference', '');
  }

  if(get(document, 'provision[0].class')){
    result.provisionClass = "";
    document.provision[0].class.forEach(function(provision){   
      if(result.provisionClass == ''){
        result.provisionClass = provision.code;
      }  else {
        result.provisionClass = result.provisionClass + ' - ' + provision.code;
      }      
    });
  }

  if(get(document, "issue[0].details.text")){
    result.operationOutcome = get(document, "issue[0].details.text");
  }

  if(get(document, "provision[0].actor[0].role.coding[0].display")){
    result.actorRole = get(document, "provision[0].actor[0].role.coding[0].display");
  } else if (get(document, "provision[0].provision[0].actor[0].role.coding[0].display")){
    result.actorRole = get(document, "provision[0].provision[0].actor[0].role.coding[0].display");
  }

  if(get(document, "provision[0].class[0].display")){
    result.provisionClass = get(document, "provision[0].class[0].display");
  } else if (get(document, "provision[0].provision[0].class[0].display")){
    result.provisionClass = get(document, "provision[0].provision[0].class[0].display");
  }

  return result;
}

export function flattenDevice(device, internalDateFormat){
  let result = {
    _id: '',
    id: '',
    meta: '',
    status: '',
    identifier: '',
    deviceType: '',
    deviceModel: '',
    manufacturer: '',
    serialNumber: '',
    costOfOwnership: '',
    lotNumber: '',
    deviceName: '',
    operationOutcome: ''
  };

  result.resourceType = get(device, 'resourceType', "Unknown");

  if(!internalDateFormat){
    internalDateFormat = "YYYY-MM-DD";
  }

  result._id = get(device, '_id', '');
  result.id = get(device, 'id', '');
  result.identifier = get(device, 'identifier[0].value', '');

  result.status = get(device, 'status', '');
  result.deviceType = get(device, 'type.text', '');
  result.deviceModel = get(device, 'model', '');
  result.manufacturer = get(device, 'manufacturer', '');
  result.serialNumber = get(device, 'identifier[0].value', '');
  result.lotNumber = get(device, 'lotNumber', '');
  result.note = get(device, 'note[0].text', '');
  result.deviceName = get(device, 'deviceName[0].name', '');

  console.log('result', JSON.stringify(result));

  if(get(device, "issue[0].details.text")){
    result.operationOutcome = get(device, "issue[0].details.text");
  }

  return result;
}

export function flattenDiagnosticReport(report, fhirVersion){  
  var result = {
    _id: '',
    id: '',
    subjectDisplay: '',
    code: '',
    status: '',
    issued: '',
    performerDisplay: '',
    identifier: '',
    category: '',
    effectiveDate: '',
    operationOutcome: ''
  };

  result.resourceType = get(report, 'resourceType', "Unknown");
  
  if (report){
    result.id = get(report, 'id');
    result._id = get(report, '_id');

    if(report.subject){
      if(report.subject.display){
        result.subjectDisplay = report.subject.display;
      } else {
        result.subjectDisplay = report.subject.reference;          
      }
    }
    if(fhirVersion === "v3.0.1"){
      if(get(report, 'performer[0].actor.display')){
        result.performerDisplay = get(report, 'performer[0].actor.display');
      } else {
        result.performerDisplay = get(report, 'performer[0].actor.reference');          
      }
    }
    if(fhirVersion === "v1.0.2"){
      if(report.performer){
        result.performerDisplay = get(report, 'performer.display');
      } else {
        result.performerDisplay = get(report, 'performer.reference'); 
      }      
    }

    if(get(report, 'category.coding[0].code')){
      result.category = get(report, 'category.coding[0].code');
    } else {
      result.category = get(report, 'category.text');
    }

    result.code = get(report, 'code.text', '');
    result.identifier = get(report, 'identifier[0].value', '');
    result.status = get(report, 'status', '');
    result.effectiveDate = moment(get(report, 'effectiveDateTime')).format("YYYY-MM-DD");
    result.issued = moment(get(report, 'issued')).format("YYYY-MM-DD"); 
  } 

  if(get(report, "issue[0].details.text")){
    result.operationOutcome = get(report, "issue[0].details.text");
  }

  return result;  
}

export function flattenDocumentReference(documentReference, internalDateFormat){
  let result = {
    _id: '',
    id: '',
    meta: '',
    masterIdentifier: '',
    identifier: '',
    status: '',
    docStatus: '',
    typeDisplay: '',
    typeCode: '',
    category: '',
    subjectReference: '',
    subjectDisplay: '',
    date: '',

    description: '',
    author: '',
    authorReference: '',

    relatesToCode: '',
    relatesToReference: '',

    contentAttachment: '',
    contentFormat: '',
    contentTitle: '',
    contentSize: '',
    contentCount: 0,
    operationOutcome: ''
  };

  result.resourceType = get(documentReference, 'resourceType', "Unknown");

  if(!internalDateFormat){
    internalDateFormat = "YYYY-MM-DD";
  }

  result._id = get(documentReference, '_id', '');
  result.id = get(documentReference, 'id', '');
  result.identifier = get(documentReference, 'identifier[0].value', '');
  result.status = get(documentReference, 'status', '');
  result.docStatus = get(documentReference, 'docStatus', '');
  result.description = get(documentReference, 'description', '');

  result.masterIdentifier = get(documentReference, 'masterIdentifier.value', '');

  result.subjectReference = get(documentReference, 'subject.reference', '');
  result.subjectDisplay = get(documentReference, 'subject.display', '');

  result.date = moment(get(documentReference, 'date')).format("YYYY-MM-DD");

  if(get(documentReference, 'category.coding[0].code')){
    result.category = get(documentReference, 'category.coding[0].code');
  } else {
    result.category = get(documentReference, 'category.text');
  }

  result.typeCode = get(documentReference, 'type.coding[0].code', '');
  result.typeDisplay = get(documentReference, 'type.text', '');

  result.author = get(documentReference, 'author[0].display', '')
  result.authorReference = get(documentReference, 'author[0].reference', '')

  result.relatesToCode = get(documentReference, 'relatesTo[0].code', '')
  result.relatesToReference = get(documentReference, 'relatesTo[0].target.reference', '')

  result.contentAttachment = get(documentReference, 'content[0].attachment.url', '')
  result.contentTitle = get(documentReference, 'content[0].attachment.title', '')
  result.contentSize = get(documentReference, 'content[0].attachment.size', '')
  result.contentFormat = get(documentReference, 'content[0].format.display', '')

  if(Array.isArray(documentReference.content)){
    result.contentCount = documentReference.content.length;
  }

  if(get(documentReference, "issue[0].details.text")){
    result.operationOutcome = get(documentReference, "issue[0].details.text");
  }

  return result;
}

export function flattenEncounter(encounter, internalDateFormat){
  let result = {
    _id: '',
    id: '',
    meta: '',
    subject: '',
    subjectId: '',
    status: '',
    statusHistory: 0,
    periodStart: '',
    periodEnd: '',
    reasonCode: '', 
    reasonDisplay: '', 
    typeCode: '',
    typeDisplay: '',
    classCode: '',
    duration: '',
    operationOutcome: ''
  };

  result.resourceType = get(encounter, 'resourceType', "Unknown");

  if(!internalDateFormat){
    internalDateFormat = get(Meteor, "settings.public.defaults.internalDateFormat", "YYYY-MM-DD");
  }

  result.id =  get(encounter, 'id');
  result._id =  get(encounter, '_id');

  result.subject = determineSubjectDisplayString(encounter);
  result.subjectId = get(encounter, 'subject.reference', '');

  result.status = get(encounter, 'status', '');
  result.reasonCode = get(encounter, 'reason[0].coding[0].code', '');
  result.reasonDisplay = get(encounter, 'reason[0].coding[0].display', '');
  result.typeCode = get(encounter, 'type[0].coding[0].code', '');
  result.typeDisplay = get(encounter, 'type[0].coding[0].display', '');

  if(get(encounter, 'class.code')){
    result.classCode = get(encounter, 'class.code', '');
  } else if(get(encounter, 'class')){
    result.classCode = get(encounter, 'class', '');
  }

  let statusHistory = get(encounter, 'statusHistory', []);

  result.statusHistory = statusHistory.length;

  let momentStart = moment(get(encounter, 'period.start', ''))
  if(get(encounter, 'period.start')){
    momentStart = moment(get(encounter, 'period.start', ''))
  } else if(get(encounter, 'performedPeriod.start')){
    momentStart = moment(get(encounter, 'performedPeriod.start', ''))
  }
  if(momentStart){
    result.periodStart = momentStart.format(internalDateFormat);
  } 

  let momentEnd;
  if(get(encounter, 'period.end')){
    momentEnd = moment(get(encounter, 'period.end', ''))
  } else if(get(encounter, 'performedPeriod.end')){
    momentEnd = moment(get(encounter, 'performedPeriod.end', ''))
  }
  if(momentEnd){
    result.periodEnd = momentEnd.format(internalDateFormat);
  } 

  if(momentStart && momentEnd){
    result.duration = Math.abs(momentStart.diff(momentEnd, 'minutes', true))
  }

  if(get(encounter, "issue[0].details.text")){
    result.operationOutcome = get(encounter, "issue[0].details.text");
  }

  return result;
}

export function flattenEndpoint(endpoint, internalDateFormat){
    let result = {
      resourceType: 'Endpoint',
      _id: '',
      id: '',
      identifier: '',
      status: '',
      periodStart: '',
      periodEnd: '',
      connectionType: '',
      version: '',
      name: '',
      managingOrganization: '',
      payloadType: '',
      payloadMimeType: '',
      address: ''
    };
    result.resourceType = get(endpoint, 'resourceType', "Unknown");
  
    if(!internalDateFormat){
        internalDateFormat = get(Meteor, "settings.public.defaults.internalDateFormat", "YYYY-MM-DD");
    }
    if(get(endpoint, 'period')){
        result.periodStart = moment(get(endpoint, 'period.start')).format(internalDateFormat);
        result.periodEnd = moment(get(endpoint, 'period.end')).format(internalDateFormat);    
    }
    
    result._id = get(endpoint, '_id');
    result.id = get(endpoint, 'id');
    result.identifier = get(endpoint, 'identifier[0].value');
    result.status = get(endpoint, 'status');
    result.name = get(endpoint, 'name');
    result.payloadType = get(endpoint, 'payloadType[0].text');
    
    result.payloadMimeType = get(endpoint, 'payloadMimeType[0]');
    result.managingOrganization = get(endpoint, 'managingOrganization.display');
    result.address = get(endpoint, 'address');

    if(get(endpoint, 'connectionType.display')){
      result.connectionType = get(endpoint, 'connectionType.display');
    } else if(get(endpoint, 'connectionType.code')){
      result.connectionType = get(endpoint, 'connectionType.code');
    } 

    result.version = get(endpoint, 'connectionType.version');

    return result;
}

export function flattenHealthcareService(service, internalDateFormat){
    let result = {
      resourceType: 'HealthcareService',
      _id: '',
      id: '',
      identifier1: '',
      identifier2: '',
      identifier3: '',
      active: true,
      category: '',
      type: '',
      specialty: '',
      name: '',
      locationDisplay: '',
      locationReference: '',
      comment: '',
      photo: '',
      phone: '',
      email: '',
      coverageAreaDisplay: '',
      coverageAreaReference: '',
      serviceProvisionCode: '',
      eligibilityCode: '',
      eligibilityCodeDisplay: '',
      eligibilityComment: '',
      providedBy: '',
      numEndpoints: 0
    };
    result.resourceType = get(service, 'resourceType', "Unknown");
  
    if(!internalDateFormat){
        internalDateFormat = get(Meteor, "settings.public.defaults.internalDateFormat", "YYYY-MM-DD");
      }
    
    result._id = get(service, '_id');
    result.id = get(service, 'id');
    result.identifier1 = get(service, 'identifier[0].value');
    result.identifier2 = get(service, 'identifier[1].value');
    result.identifier3 = get(service, 'identifier[2].value');
    result.active = get(service, 'active', true);
    result.type = get(service, 'type[0].text', '');
    result.locationDisplay = get(service, 'location.display', '');
    result.locationReference = get(service, 'location.reference', '');
    result.name = get(service, 'name', '');
    result.comment = get(service, 'comment', '');
    result.extraDetails = get(service, 'extraDetails', '');
    result.photo = get(service, 'attagment.url', '');

    result.phone = FhirUtilities.pluckPhone(get(service, 'telecom'));
    result.email = FhirUtilities.pluckEmail(get(service, 'telecom'));
  
    result.coverageAreaDisplay = get(service, 'coverageArea.display', '');
    result.coverageAreaReference = get(service, 'coverageArea.reference', '');
    result.serviceProvisionCode = get(service, 'serviceProvisionCode[0].text', '');

    result.eligibilityCode = get(service, 'eligibility[0].coding.code', '');
    result.eligibilityCodeDisplay = get(service, 'eligibility[0].coding.display', '');
    result.eligibilityComment = get(service, 'eligibility[0].comment', '');

    result.specialty = FhirUtilities.pluckCodeableConcept(get(service, 'specialty[0]'));
    result.category = FhirUtilities.pluckCodeableConcept(get(service, 'category[0]'));
    result.providedBy = FhirUtilities.pluckReference(get(service, 'providedBy'));

    if(Array.isArray(service.endpoint)){
        result.numEndpoints = service.endpoint.length;
    }

    return result;
}

export function flattenImmunization(immunization, internalDateFormat){
  let result = {
    _id: '',
    id: '',
    meta: '',
    identifier: '',
    patientDisplay: '',
    patientReference: '',
    performerDisplay: '',
    performerReference: '',
    vaccineCode: '',
    vaccineDisplay: '',
    status: '',
    reported: '',
    date: '',
    operationOutcome: ''
  };

  result.resourceType = get(immunization, 'resourceType', "Unknown");

  if(!internalDateFormat){
    internalDateFormat = "YYYY-MM-DD";
  }

  result._id =  get(immunization, 'id') ? get(immunization, 'id') : get(immunization, '_id');
  result.id = get(immunization, 'id', '');
  result.identifier = get(immunization, 'identifier[0].value', '');

  if(get(immunization, 'patient')){
    result.patientDisplay = get(immunization, 'patient.display', '');
    result.patientReference = get(immunization, 'patient.reference', '');
  } else if (get(immunization, 'subject')){
    result.patientDisplay = get(immunization, 'subject.display', '');
    result.patientReference = get(immunization, 'subject.reference', '');
  }

  if(get(immunization, 'performer')){
    result.performerDisplay = get(immunization, 'performer.display', '');
    result.performerReference = get(immunization, 'performer.reference', '');
  } 

  result.performerDisplay = get(immunization, 'asserter.display', '');

  if(get(immunization, 'status.coding[0].code')){
    result.status = get(immunization, 'status.coding[0].code', '');  //R4
  } else {
    result.status = get(immunization, 'status', '');                 // DSTU2
  }

  result.vaccineCode = get(immunization, 'vaccineCode.coding[0].code', '');

  if(get(immunization, 'vaccineCode.coding[0].display')){
    result.vaccineDisplay = get(immunization, 'vaccineCode.coding[0].display', '');  //R4
  } else {
    result.vaccineDisplay = get(immunization, 'vaccineCode.text', '');                 // DSTU2
  }

  result.barcode = get(immunization, '_id', '');

  if(get(immunization, 'occurrenceDateTime')){
    result.date = moment(get(immunization, 'occurrenceDateTime')).format("YYYY-MM-DD");
  } else {
    result.date = moment(get(immunization, 'date')).format("YYYY-MM-DD");
  }
  result.reported = moment(get(immunization, 'reported', '')).format("YYYY-MM-DD");

  if(get(immunization, "issue[0].details.text")){
    result.operationOutcome = get(immunization, "issue[0].details.text");
  }

  if(get(immunization, "issue[0].details.text")){
    result.operationOutcome = get(immunization, "issue[0].details.text");
  }

  return result;
}

export function flattenInsurancePlan(plan, internalDateFormat){
    let result = {
      resourceType: 'InsurancePlan',
      _id: '',
      id: '',
      identifier: '',
      status: '',
      type: '',
      name: '',
      alias: '',
      periodStart: '',
      periodEnd: '',
      ownedBy: '',
      administeredBy: '',
      coverageArea: '',
      coverageAreaDisplay: '',
      coverageAreaReference: '',
      coverageType: '',
      coverageBenefitType: '',
      coverageBenefitRequirement: '',
      numEndpoints: 0
    };
    result.resourceType = get(plan, 'resourceType', "InsurancePlan");
  
    if(!internalDateFormat){
        internalDateFormat = get(Meteor, "settings.public.defaults.internalDateFormat", "YYYY-MM-DD");
    }
    if(get(plan, 'period')){
        result.periodStart = moment(get(plan, 'period.start')).format(internalDateFormat);
        result.periodEnd = moment(get(plan, 'period.end')).format(internalDateFormat);    
    }

    result._id = get(plan, '_id');
    result.id = get(plan, 'id');
    result.identifier = get(plan, 'identifier[0].value');
    result.status = get(plan, 'status');
    result.name = get(plan, 'name');
    result.alias = get(plan, 'alias');

    result.coverageAreaDisplay = get(plan, 'coverageArea[0].display', '');
    result.coverageAreaReference = get(plan, 'coverageArea[0].reference', '');
    result.networkDisplay = get(plan, 'network[0].display', '');
    result.networkReference = get(plan, 'network[0].reference', '');

    result.coverageType = get(plan, 'coverage[0].type', '');
    result.coverageBenefitType = get(plan, 'coverage[0].benefit[0].type.text', '');
    result.coverageBenefitRequirement = get(plan, 'coverage[0].benefit[0].requirement', '');

    result.type = FhirUtilities.pluckCodeableConcept(get(plan, 'type[0]'));
    result.ownedBy = FhirUtilities.pluckReference(get(plan, 'ownedBy'));
    result.administeredBy = FhirUtilities.pluckReference(get(plan, 'administeredBy'));
    result.coverageArea = FhirUtilities.pluckReference(get(plan, 'coverageArea[0]'));

    if(Array.isArray(plan.endpoint)){
        result.numEndpoints = plan.endpoint.length;
    }

    return result;
}

export function flattenList(list, extensionUrl){
  console.log('flattenList', list);
  
  let result = {
    _id: '',
    id: '',
    meta: '',
    identifier: '',
    status: '',
    mode: '',
    title: '',
    subjectDisplay: '',
    subjectReference: '',
    encounterDisplay: '',
    encounterReference: '',
    date: '',
    sourceDisplay: '',
    sourceReference: '',
    oderedByText: '',
    emptyReason: '',
    itemCount: 0,
    operationOutcome: ''
  };

  result.resourceType = get(list, 'resourceType', "Unknown");

  result._id = get(list, '_id');
  result.id = get(list, 'id');
  result.identifier = get(list, 'identifier[0].value', '');
  result.status = get(list, 'status', '');
  result.mode = get(list, 'mode', '');
  result.title = get(list, 'title', '');
  result.subjectDisplay = get(list, 'subject.display', '');
  result.subjectReference = get(list, 'subject.reference', '');
  result.encounterDisplay = get(list, 'encounter.display', '');
  result.encounterReference = get(list, 'encounter.reference', '');
  result.date = get(list, 'date', '');
  result.sourceDisplay = get(list, 'source.display', '');
  result.sourceReference = get(list, 'source.reference', '');

  if(Array.isArray(list.entry)){
    result.itemCount = list.entry.length;
  }

  if(get(list, "issue[0].details.text")){
    result.operationOutcome = get(list, "issue[0].details.text");
  }

  return result;
}

export function flattenLocation(location, simplifiedAddress, preferredExtensionUrl){
  console.log('flattenLocation', preferredExtensionUrl);
  
  let result = {
    _id: '',
    id: '',
    meta: '',
    identifier: '',
    name: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    type: '',
    latitude: '',
    longitude: '',
    selectedExtension: '',
    operationOutcome: ''
  };

  result.resourceType = get(location, 'resourceType', "Unknown");

  result.severity = get(location, 'severity.text', '');

  if (get(location, 'id')){
    result.id = get(location, 'id');
  }
  if (get(location, '_id')){
    result._id = get(location, '_id');
  }
  if (get(location, 'name')) {
    result.name = get(location, 'name');
  }
  if (get(location, 'address')) {
    if(simplifiedAddress){
      result.address = FhirUtilities.stringifyAddress(get(location, 'address'), {noPrefix: true});
    } else {
      result.address = get(location, 'address');
    }
  }
  if (get(location, 'address.city')) {
    result.city = get(location, 'address.city');
  }
  if (get(location, 'address.state')) {
    result.state = get(location, 'address.state');
  }
  if (get(location, 'address.postalCode')) {
    result.postalCode = get(location, 'address.postalCode');
  }
  if (get(location, 'address.country')) {
    result.country = get(location, 'address.country');
  }
  if (get(location, 'type[0].text')) {
    result.type = get(location, 'type[0].text');
  }
  if (get(location, 'position.latitude')) {
    result.latitude = get(location, 'position.latitude', null);
  }
  if (get(location, 'position.longitude')) {
    result.longitude = get(location, 'position.longitude', null);
  }

  if (Array.isArray(get(location, 'extension'))) {

    let extensionIndex = findIndex(location.extension, {'url': preferredExtensionUrl});

    if(extensionIndex > -1){
      result.selectedExtension = location.extension[extensionIndex].valueDecimal.toString();
    }
  }

  if(get(location, "issue[0].details.text")){
    result.operationOutcome = get(location, "issue[0].details.text");
  }

  return result;
}

export function flattenMeasure(measure, internalDateFormat){
  let result = {
    _id: '',
    id: '',
    meta: '',
    identifier: '',
    name: '',
    publisher: '',
    status: '',
    title: '',
    date: '',
    approvalDate: '',
    lastReviewDate: '',
    lastEdited: '',
    author: '',
    reviewer: '',
    endorser: '',
    scoring: '',
    type: '',
    riskAdjustment: '',
    rateAggregation: '',
    supplementalDataCount: '',
    context: '', 
    version: '',
    operationOutcome: ''
  };

  result.resourceType = get(measure, 'resourceType', "Unknown");

  if(!internalDateFormat){
    internalDateFormat = get(Meteor, "settings.public.defaults.internalDateFormat", "YYYY-MM-DD");
  }

  result._id =  get(measure, '_id');
  result.id = get(measure, 'id', '');
  result.identifier = get(measure, 'identifier[0].value', '');

  if(get(measure, 'lastReviewDate')){
    result.lastReviewDate = moment(get(measure, 'lastReviewDate', '')).format(internalDateFormat);
  }
  if(get(measure, 'approvalDate')){
    result.approvalDate = moment(get(measure, 'approvalDate', '')).format(internalDateFormat);
  }
  if(get(measure, 'date')){
    result.lastEdited = moment(get(measure, 'date', '')).format(internalDateFormat);
  }

  result.publisher = get(measure, 'publisher', '');
  result.name = get(measure, 'name', '');
  result.title = get(measure, 'title', '');
  result.description = get(measure, 'description', '');
  result.status = get(measure, 'status', '');
  result.version = get(measure, 'version', '');

  result.context = get(measure, 'useContext[0].valueCodeableConcept.text', '');

  result.editor = get(measure, 'editor[0].name', '');
  result.reviewer = get(measure, 'reviewer[0].name', '');
  result.endorser = get(measure, 'endorser[0].name', '');

  result.scoring = get(measure, 'scoring.coding[0].display', '');
  result.type = get(measure, 'type[0].coding[0].display', '');

  result.riskAdjustment = get(measure, 'riskAdjustment', '');
  result.rateAggregation = get(measure, 'rateAggregation', '');
  
  let supplementalData = get(measure, 'supplementalData', []);
  result.supplementalDataCount = supplementalData.length;

  let cohorts = get(measure, 'group[0].population', []);
  result.cohortCount = cohorts.length;

  if(get(measure, "issue[0].details.text")){
    result.operationOutcome = get(measure, "issue[0].details.text");
  }

  return result;
}

export function flattenMeasureReport(measureReport, measuresCursor, internalDateFormat, measureShorthand, measureScoreType){
  let result = {
    _id: '',
    id: '',
    meta: '',
    identifier: '',
    type: '',
    measureUrl: '',
    measureTitle: '',
    date: '',
    subject: '',
    reporter: '',
    periodStart: '',
    periodEnd: '',
    groupCode: '',
    populationCode: '',
    populationCount: '',
    measureScore: '',
    stratifierCount: '',
    numerator: '',
    denominator: '',
    operationOutcome: ''
  };

  result.resourceType = get(measureReport, 'resourceType', "Unknown");

  if(!internalDateFormat){
    internalDateFormat = get(Meteor, "settings.public.defaults.internalDateFormat", "YYYY-MM-DD");
  }

  result._id = get(measureReport, '_id');
  result.id = get(measureReport, 'id', '');
  result.identifier = get(measureReport, 'identifier[0].value', '');
  result.type = get(measureReport, 'type', '');

  result.measureUrl = get(measureReport, 'measure', ''); 

  if(measuresCursor && result.measureUrl){
    let measure = measuresCursor.findOne({id: FhirUtilities.pluckReferenceId(result.measureUrl)});
    if(measureShorthand){
      result.measureTitle = get(measure, 'id');
    } else {
      result.measureTitle = get(measure, 'title');
    }
  }

  result.date = moment(get(measureReport, 'date', '')).format(internalDateFormat);
  if(get(measureReport, 'reporter.display', '')){
    result.reporter = get(measureReport, 'reporter.display', '');
  } else {
    result.reporter = FhirUtilities.pluckReferenceId(get(measureReport, 'reporter.reference', ''));
  }

  if(get(measureReport, 'subject.display', '')){
    result.subject = get(measureReport, 'subject.display', '');
  } else {
    result.subject = FhirUtilities.pluckReferenceId(get(measureReport, 'subject.reference', ''));
  }

  result.periodStart = moment(get(measureReport, 'period.start', '')).format(internalDateFormat);
  result.periodEnd = moment(get(measureReport, 'period.end', '')).format(internalDateFormat);

  result.groupCode = get(measureReport, 'group[0].coding[0].code', '');
  result.populationCode = get(measureReport, 'group[0].population[0].coding[0].code', '');
  result.populationCount = get(measureReport, 'group[0].population[0].count', '');

  if(get(measureReport, 'group[0].population')){
    let population = get(measureReport, 'group[0].population');
    population.forEach(function(pop){
      if(get(pop, 'code.text') === "numerator"){
        result.numerator = get(pop, 'count');
      }
      if(get(pop, 'code.text') === "denominator"){
        result.denominator = get(pop, 'count');        
      }
    })
  }

  if(has(measureReport, 'group[0].measureScore.value')){
    result.measureScore = get(measureReport, 'group[0].measureScore.value', '');
  } else if(has(measureReport, 'group[0].population')){
    if(Array.isArray(get(measureReport, 'group[0].population'))){
      measureReport.group[0].population.forEach(function(pop){
        if(Array.isArray(get(pop, 'code.coding'))){
          pop.code.coding.forEach(function(coding){
            if(coding.code === measureScoreType){
              result.measureScore = pop.count;
            }
          })
        }        
      })
    }
  }

  let stratifierArray = get(measureReport, 'group[0].stratifier', []);
  result.stratifierCount = stratifierArray.length;

  if(get(measureReport, "issue[0].details.text")){
    result.operationOutcome = get(measureReport, "issue[0].details.text");
  }

  return result;
}

export function flattenMedication(medication, dateFormat){
  let result = {
    _id: '',
    id: '',
    status: '',
    identifier: '',

    code: '',

    marketingAuthorizationHolderDisplay: '',
    marketingAuthorizationHolderReference: '',
    doseForm: '',
    totalVolume: '',

    activeIngredient: '',
    strengthRatio: '',
    strengthQuantity: '',
    lotNumber: '', 
    expirationDate: '',
    definitionReference: '',
    definitionDisplay: ''
  };

  result.resourceType = get(medication, 'resourceType', "Medication");

  result._id = get(medication, '_id');
  result.id = get(medication, 'id', '');


  result.status = get(medication, 'status', '');
  result.identifier = get(medication, 'identifier[0].value', '');

  if(get(medication, 'code.text', '')){
    result.code = get(medication, 'code.text', ''); 
  } else {
    result.code = get(medication, 'code.coding[0].code', '');
  }

  result.marketingAuthorizationHolderDisplay = get(medication, 'marketingAuthorizationHolder.display', '');
  result.marketingAuthorizationHolderReference = get(medication, 'marketingAuthorizationHolder.reference', '');

  if(get(medication, 'doseForm.text', '')){
    result.doseForm = get(medication, 'doseForm.text', ''); 
  } else {
    result.doseForm = get(medication, 'doseForm.coding[0].code', '');
  }

  result.totalVolume = get(medication, 'totalVolume.value', '') + ' ' + get(medication, 'totalVolume.unit', ''); 

  if(get(medication, 'ingredient[0].concept.text')){
    result.activeIngredient = get(medication, 'ingredient[0].concept.text', '');
  } else if(get(medication, 'ingredient[0].reference.display')){
    result.activeIngredient = get(medication, 'ingredient[0].reference.display', '');
  } else {
    result.activeIngredient = get(medication, 'ingredient[0].reference.reference', '');
  }

  result.strengthRatio = get(medication, 'ingredient[0].numerator.value', '') + ' ' + get(medication, 'ingredient[0].numerator.unit', '');  + '/' + get(medication, 'ingredient[0].denominator.value', '') + ' ' + get(medication, 'ingredient[0].denominator.unit', ''); ; 
  result.strengthQuantity = get(medication, 'ingredient[0].value', '') + ' ' + get(medication, 'ingredient[0].unit', ''); 

  result.lotNumber = get(medication, 'batch.lotNumber', '');
  result.expirationDate = get(medication, 'batch.expirationDate', '');
  
  result.definitionReference = get(medication, 'definition.reference', '');
  result.definitionDisplay = get(medication, 'definition.display', '');

  return result;
}

export function flattenMedicationOrder(medicationOrder, dateFormat){
  let result = {
    _id: '',
    id: '',
    status: '',
    identifier: '',
    patientDisplay: '',
    patientReference: '',
    prescriberDisplay: '',
    asserterDisplay: '',
    clinicalStatus: '',
    snomedCode: '',
    snomedDisplay: '',
    evidenceDisplay: '',
    barcode: '',
    dateWritten: '',
    dosageInstructionText: '',
    medicationCodeableConcept: '',
    medicationCode: '',
    dosage: '',
    operationOutcome: ''
  };

  result.resourceType = get(medicationOrder, 'resourceType', "Unknown");

  result._id = get(medicationOrder, '_id');
  result.id = get(medicationOrder, 'id', '');

  if(!dateFormat){
    dateFormat = get(Meteor, "settings.public.defaults.dateFormat", "YYYY-MM-DD");
  }

  if (get(medicationOrder, 'medicationReference.display')){
    result.medicationCodeableConcept = get(medicationOrder, 'medicationReference.display');
  } else if(get(medicationOrder, 'medicationCodeableConcept')){
    result.medicationCodeableConcept = get(medicationOrder, 'medicationCodeableConcept.text');
    result.medicationCode = get(medicationOrder, 'medicationCodeableConcept.coding[0].code');
  } 

  result.status = get(medicationOrder, 'status');
  result.identifier = get(medicationOrder, 'identifier[0].value');
  result.patientDisplay = get(medicationOrder, 'patient.display');
  result.patientReference = get(medicationOrder, 'patient.reference');
  result.prescriberDisplay = get(medicationOrder, 'prescriber.display');
  result.dateWritten = moment(get(medicationOrder, 'dateWritten')).format(dateFormat);
  
  result.dosage = get(medicationOrder, 'dosageInstruction[0].text');
  result.barcode = get(medicationOrder, '_id');

  if(get(medicationOrder, "issue[0].details.text")){
    result.operationOutcome = get(medicationOrder, "issue[0].details.text");
  }

  return result;
}

export function flattenMedicationStatement(statement, fhirVersion){
  console.log('flattenMedicationStatement', statement)

  var result = {
    _id: '',
    id: '',
    medication: '',
    medicationReference: '',
    medicationDisplay: '',
    reasonCodeCode: '',
    reasonCodeDisplay: '',
    basedOn: '',
    effectiveDateTime: '',
    dateAsserted: '',
    informationSource: '',
    subjectDisplay: '',
    taken: '',
    reasonCodeDisplay: '',
    dosage: '',
    operationOutcome: ''
  };

  result.resourceType = get(statement, 'resourceType', "Unknown");

  result._id = get(statement, '_id');
  result.id = get(statement, 'id', '');

  // DSTU2
  if(fhirVersion === "DSTU2"){
    result.subjectDisplay = get(statement, 'patient.display');
    result.medicationReference = get(statement, 'medicationReference.reference');
    result.medicationDisplay = get(statement, 'medicationReference.display');
    result.medicationCode = get(statement, 'medicationReference.display');
    result.reasonCode = get(statement, 'reasonForUseCodeableConcept.coding[0].code');
    result.reasonCodeDisplay = get(statement, 'reasonForUseCodeableConcept.coding[0].display');
    result.identifier = get(statement, 'identifier[0].value');
    result.effectiveDateTime = moment(get(statement, 'effectiveDateTime')).format("YYYY-MM-DD");
    result.dateAsserted = moment(get(statement, 'dateAsserted')).format("YYYY-MM-DD");
    result.informationSource = get(statement, 'supportingInformation[0].display');
    result.reasonCodeDisplay = get(statement, 'reasonForUseCodeableConcept.coding[0].display');  
  } else if(fhirVersion === "STU3"){
    result.subjectDisplay = get(statement, 'subject.display');
    result.medicationReference = get(statement, 'medicationReference.reference');
    result.medicationDisplay = get(statement, 'medicationReference.display');
    result.medicationCode = get(statement, 'medicationCodeableConcept.coding[0].display');
    result.identifier = get(statement, 'identifier[0].value');
    result.effectiveDateTime = moment(get(statement, 'effectiveDateTime')).format("YYYY-MM-DD");
    result.dateAsserted = moment(get(statement, 'dateAsserted')).format("YYYY-MM-DD");
    result.informationSource = get(statement, 'informationSource.display');
    result.taken = get(statement, 'taken');
    result.reasonCodeDisplay = get(statement, 'reasonCode[0].coding[0].display');  
  } else { // assume R4
    result.subjectDisplay = get(statement, 'subject.display');
    result.medicationReference = get(statement, 'medicationReference.reference');
    result.medicationDisplay = get(statement, 'medicationReference.display');
    result.medicationCode = get(statement, 'medicationCodeableConcept.coding[0].display');
    result.reasonCode = get(statement, 'reasonCode.coding[0].code');
    result.reasonCodeDisplay = get(statement, 'reasonCode.coding[0].display');
    result.identifier = get(statement, 'identifier[0].value');
    result.effectiveDateTime = moment(get(statement, 'effectiveDateTime')).format("YYYY-MM-DD");
    result.dateAsserted = moment(get(statement, 'dateAsserted')).format("YYYY-MM-DD");
    result.informationSource = get(statement, 'informationSource.display');    
  }

  if(get(statement, "issue[0].details.text")){
    result.operationOutcome = get(statement, "issue[0].details.text");
  }
  
  return result;
}

export function flattenNetwork(organization, internalDateFormat){
    let result = {
      resourceType: 'Network',
      _id: '',
      id: '',
      identifier: '',
      active: false,
      periodStart: '',
      periodEnd: '',
      name: '',
      alias: '',
      address: '',
      primaryContactName: '',
      primaryContactPhone: '',
      primaryContactEmail: ''
    };
    result.resourceType = get(organization, 'resourceType', "Network");
  
    if(!internalDateFormat){
        internalDateFormat = get(Meteor, "settings.public.defaults.internalDateFormat", "YYYY-MM-DD");
    }
    if(get(organization, 'organization-period')){
        result.periodStart = moment(get(organization, 'organization-period.start')).format(internalDateFormat);
        result.periodEnd = moment(get(organization, 'organization-period.end')).format(internalDateFormat);    
    }

    result._id = get(organization, '_id');
    result.id = get(organization, 'id');
    result.identifier = get(organization, 'identifier[0].value');
    result.active = get(organization, 'active', false);
    result.name = get(organization, 'name');
    result.alias = get(organization, 'alias');
    result.address = FhirUtilities.stringifyAddress(get(organization, 'address'));

    result.primaryContactName = FhirUtilities.pluckPhone(get(organization, 'contact.name'));
    result.primaryContactPhone = FhirUtilities.pluckPhone(get(organization, 'contact.telecom'));
    result.primaryContactEmail = FhirUtilities.pluckEmail(get(organization, 'contact.telecom'));

    if(Array.isArray(organization.endpoint)){
        result.numEndpoints = organization.endpoint.length;
    }

    return result;
}

export function flattenObservation(observation, dateFormat, numeratorCode, denominatorCode, multiComponentValues, sampledData){
  let result = {
    _id: '',
    meta: '',
    category: '',
    codeValue: '',
    codeDisplay: '',
    valueString: '',
    value: '',
    units: '',
    system: '',
    comparator: '',
    quantityCode: '',
    observationValue: '',
    subject: '',
    subjectReference: '',
    status: '',
    device: '',
    deviceReference: '',
    createdBy: '',
    effectiveDateTime: '',
    issued: '',
    unit: '',
    numerator: '',
    denominator: '',

    sampledPeriod: 0,
    sampledMin: 0,
    sampledMax: 0,
    operationOutcome: ''
  };

  result.resourceType = get(observation, 'resourceType', "Unknown");

  if(!dateFormat){
    dateFormat = get(Meteor, "settings.public.defaults.dateFormat", "YYYY-MM-DD hh a");
  }

  result._id =  get(observation, 'id') ? get(observation, 'id') : get(observation, '_id');

  if(get(observation, 'category[0].text')){
    result.category = get(observation, 'category[0].text', '');
  } else if (get(observation, 'category[0].coding[0].display')){
    result.category = get(observation, 'category[0].coding[0].display', '');
  }

  if(Array.isArray(get(observation, 'code.coding'))){
    observation.code.coding.forEach(function(encoding){
      
      // don't display categorical codes
      if(!["8716-3"].includes(get(encoding, 'code'))){
        result.codeValue = get(encoding, 'code', '');
        if(has(encoding, 'display')){
          result.codeDisplay = get(encoding, 'display', '');
        } else {
          result.codeDisplay = get(observation, 'code.text', '');
        }
      }  
    })
  } else {
    result.codeValue = get(observation, 'code.text', '');
    result.codeDisplay = get(observation, 'code.text', '');
  }   

  
  result.subject = get(observation, 'subject.display', '');
  result.subjectReference = get(observation, 'subject.reference', '');
  result.device = get(observation, 'device.display', '');
  result.deviceReference = get(observation, 'device.reference', '');
  result.status = get(observation, 'status', '');
  
  if(get(observation, 'effectiveDateTime')){
    result.effectiveDateTime =  moment(get(observation, 'effectiveDateTime')).format(dateFormat);
  }
  if(get(observation, 'issued')){
    result.effectiveDateTime =  moment(get(observation, 'issued')).format(dateFormat);    
  }

  result.category = get(observation, 'category.text', '');


  // SINGLE COMPONENT OBSERVATIONS
  result.unit = get(observation, 'code.valueQuantity.unit');
  result.system = get(observation, 'code.valueQuantity.system');
  result.value = get(observation, 'code.valueQuantity.value');
  result.quantityCode = get(observation, 'code.valueQuantity.code');

  // MULTICOMPONENT OBSERVATIONS
  if(Array.isArray(get(observation, 'component'))){
    result.valueString = observation.component.length + ' samplesets / sec';
    result.units = 'components / sec';
    // sometimes observations have multiple components
    // a great example is blood pressure, which includes systolic and diastolic measurements
    observation.component.forEach(function(componentObservation){
      // we grab the numerator and denominator and put in separate fields
      if(get(componentObservation, 'code.coding[0].code') === numeratorCode){
        result.numerator = get(componentObservation, 'valueQuantity.value') + get(componentObservation, 'code.valueQuantity.unit')
      }
      if(get(componentObservation, 'code.coding[0].code') === denominatorCode){
        result.denominator = get(componentObservation, 'valueQuantity.value') + get(componentObservation, 'code.valueQuantity.unit')
      }
    })

    // and if it's multiComponentValue, we string it all together into a nice string to be displayed
    if(multiComponentValues){
      result.unit = get(observation, 'valueQuantity.unit', '');  
      result.valueString = result.numerator + " / " + result.denominator + " " +  result.unit;
    }
    if(sampledData){
      result.units = 'samples/sec';
      result.sampledPeriod = get(observation.component[0], 'valueSampledData.period', 0);
      result.sampledMin = get(observation.component[0], 'valueSampledData.lowerLimit', 0);
      result.sampledMax = get(observation.component[0], 'valueSampledData.upperLimit', 0);
      result.valueString = get(observation, 'valueSampledData.period', 0);

      if(has(observation.component[0], 'valueSampledData.data')){
        let sampledData = get(observation.component[0], 'valueSampledData.data');
        if(sampledData){
          let sampledDataArray = sampledData.split(" ")
          result.sampledChecksum = sampledDataArray.length;  
        }
      }
    }

  } else {
    // most observations arrive in a single component
    // some values are a string, such as Blood Type, or pos/neg
    if(get(observation, 'valueString')){
      result.valueString = get(observation, 'valueString', '');
    } else if(get(observation, 'valueCodeableConcept')){
      result.valueString = get(observation, 'valueCodeableConcept.text', '');
    } else if(get(observation, 'valueSampledData')){      
      result.units = 'samples/sec';
      result.sampledPeriod = get(observation, 'valueSampledData.period', 0);
      result.sampledMin = get(observation, 'valueSampledData.lowerLimit', 0);
      result.sampledMax = get(observation, 'valueSampledData.upperLimit', 0);
      result.valueString = get(observation, 'valueSampledData.period', 0);
    } else {
      // other values are quantities with units
      // we need to place the quantity bits in the appropriate cells
      result.comparator = get(observation, 'valueQuantity.comparator', '');
      result.observationValue = Number.parseFloat(get(observation, 'valueQuantity.value', 0)).toFixed(2);;
      result.unit = get(observation, 'valueQuantity.unit', '');  

      // but we also want to string it together into a nice readable string
      result.valueString = result.comparator + " " + result.observationValue + " " + result.unit;
    }
  }

  if(result.valueString.length > 0){
    result.value = result.valueString;
  } else {
    if(result.comparator){
      result.value = result.comparator + ' ';
    } 
    result.value = result.value + result.observationValue + ' ' + result.unit;
  }

  if(get(observation, "issue[0].details.text")){
    result.operationOutcome = get(observation, "issue[0].details.text");
  }

  return result;
}

export function flattenOrganization(organization, internalDateFormat){
  let result = {
    _id: '',
    id: '',
    meta: '',
    name: '',
    identifier: '',
    phone: '',
    email: '',
    addressLine: '',
    text: '',
    city: '',
    state: '',
    postalCode: '',
    fullAddress: '',
    operationOutcome: '',
    numEndpoints: 0
  };

  result.resourceType = get(organization, 'resourceType', "Unknown");

  result._id = get(organization, '_id', '');
  result.id = get(organization, 'id', '');
  result.identifier = get(organization, 'identifier[0].value', '');

  result.name = get(organization, 'name', '')

  result.phone = FhirUtilities.pluckPhone(get(organization, 'telecom'));
  result.email = FhirUtilities.pluckEmail(get(organization, 'telecom'));

  result.addressLine = get(organization, 'address[0].line[0]');
  result.city = get(organization, 'address[0].city');
  result.state = get(organization, 'address[0].state');
  result.postalCode = get(organization, 'address[0].postalCode');
  result.country = get(organization, 'address[0].country');

  result.fullAddress = FhirUtilities.stringifyAddress(get(organization, 'address[0]'));

  if(get(organization, "issue[0].details.text")){
    result.operationOutcome = get(organization, "issue[0].details.text");
  }

  if(Array.isArray(organization.endpoint)){
    result.numEndpoints = organization.endpoint.length;
  }

  return result;
}

export function flattenOrganizationAffiliation(organization, internalDateFormat){
    let result = {
      resourceType: 'OrganizationAffiliation',
      _id: '',
      id: '',
      identifier: '',
      active: true,
      periodStart: '',
      periodEnd: '',
      organization: '',
      participatingOrganization: '',
      network: '',
      code: '',
      specialty: '',
      location: '',
      healthcareService: '',
      email: '',
      phone: '',
      numEndpoints: 0      
    };
    result.resourceType = get(organization, 'resourceType', "OrganizationAffiliation");
    result._id = get(organization, '_id');
    result.id = get(organization, 'id');
    result.identifier = FhirUtilities.pluckFirstIdentifier(get(organization, 'identifier'));
    result.active = get(organization, 'active', true);
  
    if(!internalDateFormat){
        internalDateFormat = get(Meteor, "settings.public.defaults.internalDateFormat", "YYYY-MM-DD");
    }
    if(get(organization, 'period')){
        result.periodStart = moment(get(organization, 'period.start')).format(internalDateFormat);
        result.periodEnd = moment(get(organization, 'period.end')).format(internalDateFormat);    
    }

    result.organization = FhirUtilities.pluckReference(get(organization, 'organization'));
    result.participatingOrganization = FhirUtilities.pluckReference(get(organization, 'participatingOrganization'));
    result.network = FhirUtilities.pluckReference(get(organization, 'network[0]'));
    result.code = FhirUtilities.pluckCodeableConcept(get(organization, 'code[0]'));
    result.specialty = FhirUtilities.pluckCodeableConcept(get(organization, 'specialty[0]'));

    result.location = FhirUtilities.pluckReference(get(organization, 'location[0]'));
    result.healthcareService = FhirUtilities.pluckReference(get(organization, 'healthcareService[0]'));

    result.phone = FhirUtilities.pluckPhone(get(organization, 'telecom'));
    result.email = FhirUtilities.pluckEmail(get(organization, 'telecom'));

    if(Array.isArray(organization.endpoint)){
      result.numEndpoints = organization.endpoint.length;
    }

    return result;
}

export function flattenPatient(patient, internalDateFormat){
  let result = {
    _id: '',
    id: '',
    meta: '',
    identifier: '',
    active: true,
    gender: get(patient, 'gender'),
    name: get(patient, 'name[0].text', ''),
    mrn: '',
    birthDate: '',
    photo: "/thumbnail-blank.png",
    addressLine: '',
    state: '',
    postalCode: '',
    country: '',
    maritalStatus: '',
    preferredLanguage: '',
    species: '',
    resourceCounts: '',
    deceased: false,
    operationOutcome: ''
  };

  result.resourceType = get(patient, 'resourceType', "Unknown");

  result._id = get(patient, '_id', '');
  result.id = get(patient, 'id', '');
  result.identifier = get(patient, 'identifier[0].value', '');

  result.identifier = get(patient, 'identifier[0].value', '');
  result.active = get(patient, 'active', true).toString();
  
  result.gender = get(patient, 'gender', '');

  // patient name has gone through a number of revisions, and we need to search a few different spots, and assemble as necessary  
  let resultingNameString = "";

    // the majority of systems out there are SQL based and make a design choice to store as 'first' and 'last' name
    // critiques of that approach can be saved for a later time
    // but suffice it to say that we need to assemble the parts

    if(get(patient, 'name[0].prefix[0]')){
      resultingNameString = get(patient, 'name[0].prefix[0]')  + ' ';
    }

    if(get(patient, 'name[0].given[0]')){
      resultingNameString = resultingNameString + get(patient, 'name[0].given[0]')  + ' ';
    }

    if(get(patient, 'name[0].family')){
      // R4 - droped the array of family names; one authoritative family name per patient
      resultingNameString = resultingNameString + get(patient, 'name[0].family')  + ' ';
    } else if (get(patient, 'name[0].family[0]')){
      // DSTU2 and STU3 - allows an array of family names
      resultingNameString = resultingNameString + get(patient, 'name[0].family[0]')  + ' ';
    }
    
    if(get(patient, 'name[0].suffix[0]')){
      resultingNameString = resultingNameString + ' ' + get(patient, 'name[0].suffix[0]');
    }

  // some systems will store the name as it is to be displayed in the name[0].text field
  // if that's present, use it
  if(has(patient, 'name[0].text')){
    resultingNameString = get(patient, 'name[0].text', '');    
  }

  // remove any whitespace from the name
  result.name = resultingNameString.trim();

  // there's an off-by-1 error between momment() and Date() that we want
  // to account for when converting back to a string
  // which is why we run it through moment()
  result.birthDate = moment(get(patient, "birthDate")).format("YYYY-MM-DD")

  result.photo = get(patient, 'photo[0].url', '');

  result.maritalStatus = get(patient, 'maritalStatus.text', '');

  let communicationArray = [];
  if(get(patient, 'communication') && Array.isArray(get(patient, 'communication'))){
    communicationArray = get(patient, 'communication');
    // first, we're going to try to loop through the communications array 
    // and find an authoritatively preferred language
    communicationArray.forEach(function(communication){
      if(get(communication, "preferred")){
        if(get(communication, "text")){
          // using the text field if possible
          result.preferredLanguage = get(communication, "text");
        } else {
          // but resorting to a code name, if needed
          result.preferredLanguage = get(communication, "coding[0].display");
        }
      }
    })
    // if we didn't find any langauge that is marked as preferred 
    if(result.preferredLanguage === ""){
      // then we try the same thing on the first language listed
      if(get(communicationArray[0], "text")){
        result.preferredLanguage = get(communicationArray[0], "text");
      } else if (get(communicationArray[0], "coding[0].display")) {
        result.preferredLanguage = get(communicationArray[0], "coding[0].display")
      }
    }
  }


  // is the patient dead?  :(
  result.deceased = get(patient, 'deceasedBoolean', '');

  // DSTU2 & STU3 
  result.species = get(patient, 'animal.species.text', '');


  // address
  result.addressLine = get(patient, 'address[0].line[0]')
  result.state = get(patient, 'address[0].state')
  result.postalCode = get(patient, 'address[0].postalCode')
  result.country = get(patient, 'address[0].country')

  if(get(patient, "issue[0].details.text")){
    result.operationOutcome = get(patient, "issue[0].details.text");
  }

  
  // console.log('flattened', result)
  return result;
}

export function flattenPractitioner(practitioner, fhirVersion){
  // console.log('PractitionersTable.flattenPractitioner()', practitioner)

  let result = {
    _id: '',
    id: '',
    name: '',
    phone: '',
    email: '',
    identifier: '',
    qualification: '',
    qualificationIssuer: '',
    qualificationIdentifier: '',
    qualificationCode: '',
    qualificationStart: null,
    qualificationEnd: null,
    text: '',
    line: '',
    city: '',
    state: '',
    addressString: '',
    postalCode: '',
    fullName: '',
    operationOutcome: '',
    specialtyCode: ''
  };

  result.resourceType = get(practitioner, 'resourceType', "Unknown");

  result._id = get(practitioner, '_id', '');
  result.id = get(practitioner, 'id', '');

  result.identifier = FhirUtilities.pluckFirstIdentifier(get(practitioner, 'identifier'));

  //---------------------------------------------------------
    // TODO REFACTOR:  HumanName
    // parse name!
    // totally want to extract this

    // STU3 and R4
    if(Array.isArray(practitioner.name)){
      if(get(practitioner, 'name[0].text')){
        result.name = get(practitioner, 'name[0].text');
      } else {
        if(get(practitioner, 'name[0].suffix[0]')){
          result.name = get(practitioner, 'name[0].suffix[0]')  + ' ';
        }
    
        result.name = result.name + get(practitioner, 'name[0].given[0]') + ' ';
        
        if(get(practitioner, 'name[0].family[0]')){
          result.name = result.name + get(practitioner, 'name[0].family[0]');
        } else {
          result.name = result.name + get(practitioner, 'name[0].family');
        }
        
        if(get(practitioner, 'name[0].suffix[0]')){
          result.name = result.name + ' ' + get(practitioner, 'name[0].suffix[0]');
        }
      } 
    } else {
      // DSTU2
      if(get(practitioner, 'name.text')){
        result.name = get(practitioner, 'name.text');
      } else {
        if(get(practitioner, 'name.suffix[0]')){
          result.name = get(practitioner, 'name.suffix[0]')  + ' ';
        }
    
        result.name = result.name + get(practitioner, 'name.given[0]') + ' ';
        
        if(get(practitioner, 'name.family[0]')){
          result.name = result.name + get(practitioner, 'name.family[0]');
        } else {
          result.name = result.name + get(practitioner, 'name.family');
        }
        
        if(get(practitioner, 'name.suffix[0]')){
          result.name = result.name + ' ' + get(practitioner, 'name.suffix[0]');
        }
      } 
    }
  
  //---------------------------------------------------------

  if(has(practitioner, 'qualification[0]')){
    result.qualificationId = get(practitioner, 'qualification[0].identifier[0].value');
    result.qualification = FhirUtilities.pluckCodeableConcept(get(practitioner, 'qualification[0].code'));
    result.qualificationCode = get(practitioner, 'qualification[0].code.coding[0].code');
    result.qualificationStart = moment(get(practitioner, 'qualification[0].period.start')).format("MMM YYYY");
    result.qualificationEnd = moment(get(practitioner, 'qualification[0].period.end')).format("MMM YYYY");
    result.issuer = get(practitioner, 'qualification[0].issuer.display');  
  }

  result.phone = FhirUtilities.pluckPhone(get(practitioner, 'telecom'));
  result.email = FhirUtilities.pluckEmail(get(practitioner, 'telecom'));

  result.text = get(practitioner, 'address[0].text', '')
  result.line = get(practitioner, 'address[0].line[0]', '')
  result.city = get(practitioner, 'address[0].city', '')
  result.state = get(practitioner, 'address[0].state', '')
  result.postalCode = get(practitioner, 'address[0].postalCode', '')
  result.addressString = FhirUtilities.stringifyAddress(get(practitioner, 'address[0]'));

  if(has(practitioner, 'name[0]')){
    result.fullName = FhirUtilities.assembleName(get(practitioner, 'name[0]'))
  }

  if(get(practitioner, "issue[0].details.text")){
    result.operationOutcome = get(practitioner, "issue[0].details.text");
  }
  
  if(Array.isArray(get(practitioner, 'identifier'))){
    practitioner.identifier.forEach(function(ident){
      if(get(ident, 'type.text') === "Healthcare Provider Taxonomy Code"){
        result.specialtyCode = get(ident, 'value')
      }
    })
  }
  if(get(practitioner, "issue[0].details.text")){
    result.operationOutcome = get(practitioner, "issue[0].details.text");
  }

  return result;
}

export function flattenPractitionerRole(role, internalDateFormat){
    let result = {
      resourceType: 'PractitionerRole',
      _id: '',
      id: '',
      status: '',
      active: true,
      identifier: '',
      periodStart: '',
      periodEnd: '',
      practitioner: '',
      organization: '',
      location: '',
      healthcareService: '',
      code: '',
      specialty: '',
      numEndpoints: 0
    };
    result.resourceType = get(role, 'resourceType', "PractitionerRole");
    result._id = get(role, '_id');
    result.id = get(role, 'id');


    if(!internalDateFormat){
        internalDateFormat = get(Meteor, "settings.public.defaults.internalDateFormat", "YYYY-MM-DD");
    }
    if(get(role, 'period')){
        result.periodStart = moment(get(role, 'period.start')).format(internalDateFormat);
        result.periodEnd = moment(get(role, 'period.end')).format(internalDateFormat);    
    }
    
    result.active = get(role, 'active', false);
    result.status = get(role, 'status', '');
    result.identifier = FhirUtilities.pluckFirstIdentifier(get(role, 'identifier'));

    result.practitioner = FhirUtilities.pluckReference(get(role, 'practitioner'));
    result.organization = FhirUtilities.pluckReference(get(role, 'organization'));
    result.location = FhirUtilities.pluckReference(get(role, 'location[0]'));
    result.healthcareService = FhirUtilities.pluckReference(get(role, 'healthcareService[0]'));

    result.code = FhirUtilities.pluckCodeableConcept(get(role, 'code[0]'));
    result.specialty = FhirUtilities.pluckCodeableConcept(get(role, 'specialty[0]'));

    result.phone = FhirUtilities.pluckPhone(get(role, 'telecom'));
    result.email = FhirUtilities.pluckEmail(get(role, 'telecom'));
  
    if(Array.isArray(role.endpoint)){
        result.numEndpoints = role.endpoint.length;
    }
    return result;
}

export function flattenProcedure(procedure, internalDateFormat){
  let result = {
    _id: '',
    id: '',
    meta: '',
    identifier: '',
    status: '',
    categoryDisplay: '',
    code: '',
    codeDisplay: '',
    subject: '',
    subjectReference: '',
    performerDisplay: '',
    performedStart: '',
    performedEnd: '',
    notesCount: '',
    bodySiteDisplay: '',
    operationOutcome: ''
  };

  result.resourceType = get(procedure, 'resourceType', "Unknown");

  if(!internalDateFormat){
    internalDateFormat = "YYYY-MM-DD";
  }

  result._id = get(procedure, '_id');
  result.id = get(procedure, 'id', '');
  
  result.status = get(procedure, 'status', '');
  result.categoryDisplay = get(procedure, 'category.coding[0].display', '');
  result.identifier = get(procedure, 'identifier[0].value');
  result.code = get(procedure, 'code.coding[0].code');
  result.codeDisplay = get(procedure, 'code.coding[0].display');
  result.categoryDisplay = get(procedure, 'category.coding[0].display')    

  if(get(procedure, 'subject')){
    result.subject = get(procedure, 'subject.display', '');
    result.subjectReference = get(procedure, 'subject.reference', '');
  } else if(get(procedure, 'patient')){
    result.subject = get(procedure, 'patient.display', '');
    result.subjectReference = get(procedure, 'patient.reference', '');
  }

  result.performedStart = moment(get(procedure, 'performedDateTime')).format(internalDateFormat);      
  result.performerDisplay = get(procedure, 'performer.display');
  result.performerReference = get(procedure, 'performer.reference');
  result.bodySiteDisplay = get(procedure, 'bodySite.display');

  if(get(procedure, 'performedPeriod')){
    result.performedStart = moment(get(procedure, 'performedPeriod.start')).format(internalDateFormat);      
    result.performedEnd = moment(get(procedure, 'performedPeriod.end')).format(internalDateFormat);      
  }

  let notes = get(procedure, 'notes')
  if(notes && notes.length > 0){
    result.notesCount = notes.length;
  } else {
    result.notesCount = 0;
  }

  if(get(procedure, "issue[0].details.text")){
    result.operationOutcome = get(procedure, "issue[0].details.text");
  }

  return result;
}

export function flattenProvenance(provenance, internalDateFormat){
  let result = {
    _id: '',
    id: '',
    meta: '',
    targetDisplay: '',
    targetType: '',
    targetReference: '',
    occurredDateTime: '',
    occurredPeriodEnd: '',
    recorded: '',
    policy: '',
    locationReference: '',
    locationDisplay: '',
    reason: '',
    activity: '',
    numAgents: 0,
    numEntitites: 0,
    signature: ""
  };

  result.resourceType = get(provenance, 'resourceType', "Unknown");

  if(!internalDateFormat){
    internalDateFormat = "YYYY-MM-DD";
  }

  result._id = get(provenance, '_id');
  result.id = get(provenance, 'id', '');

  result.targetReference = get(provenance, 'target[0].reference', '');
  result.targetType = get(provenance, 'target[0].type', '');
  result.targetDisplay = get(provenance, 'target[0].display', '');
  
  result.occurredDateTime = moment(get(provenance, 'occurredDateTime', '')).format(internalDateFormat);

  if(get(provenance, 'occurredPeriod.start')){
    result.occurredDateTime = moment(get(provenance, 'occurredPeriod.start', '')).format(internalDateFormat);
  }
  if(get(provenance, 'occurredPeriod.end')){
    result.occurredPeriodEnd = moment(get(provenance, 'occurredPeriod.end', '')).format(internalDateFormat);    
  }

  result.recorded = moment(get(provenance, 'recorded', '')).format(internalDateFormat);

  result.policy = get(provenance, 'policy[0]', '');

  result.locationReference = get(provenance, 'location[0].reference', '');
  result.locationDisplay = get(provenance, 'location[0].display', '');

  if(Array.isArray(get(provenance, 'agent'))){
    result.numAgents = provenance.agent.length;
  }
  if(Array.isArray(get(provenance, 'entity'))){
    result.numEntitites = provenance.entity.length;
  }

  result.signature = get(provenance, 'signature[0].data', '');

  return result;
}

export function flattenQuestionnaire(questionnaire){
  let result = {
    _id: get(questionnaire, '_id'),
    id: get(questionnaire, 'id'),
    identifier: '',
    title: '',
    state: '',
    date: '',
    numItems: 0,
    operationOutcome: ''
  };

  result.resourceType = get(questionnaire, 'resourceType', "Unknown");

  result.id = get(questionnaire, 'id', '');

  result.date = moment(questionnaire.date).add(1, 'days').format("YYYY-MM-DD")
  result.title = get(questionnaire, 'title', '');
  result.status = get(questionnaire, 'status', '');
  result.identifier = get(questionnaire, 'identifier[0].value', '');

  if(Array.isArray(questionnaire.item)){
    result.numItems = questionnaire.item.length;
  }  
  
  if(get(questionnaire, "issue[0].details.text")){
    result.operationOutcome = get(questionnaire, "issue[0].details.text");
  }
  
  return result;
}

export function flattenQuestionnaireResponse(questionnaireResponse){
  let result = {
    _id: get(questionnaireResponse, '_id'),
    id: get(questionnaireResponse, 'id'),
    title: '',
    identifier: '',
    questionnaire: '',
    status: '',
    subjectDisplay: '',
    subjectReference: '',
    sourceDisplay: '',
    sourceReference: '',
    encounter: '',
    author: '',
    date: '',
    count: 0,
    numItems: 0,
    authored: '',
    operationOutcome: ''
  };

  result.resourceType = get(questionnaireResponse, 'resourceType', "Unknown");

  // there's an off-by-1 error between momment() and Date() that we want
  // to account for when converting back to a string
  result.date = moment(questionnaireResponse.authored).add(1, 'days').format("YYYY-MM-DD HH:mm")
  result.questionnaire = get(questionnaireResponse, 'questionnaire', '');
  result.encounter = get(questionnaireResponse, 'encounter.reference', '');
  result.subjectDisplay = get(questionnaireResponse, 'subject.display', '');
  result.subjectReference = get(questionnaireResponse, 'subject.reference', '');
  result.sourceDisplay = get(questionnaireResponse, 'source.display', '');
  result.sourceReference = get(questionnaireResponse, 'source.reference', '');
  result.author = get(questionnaireResponse, 'author.display', '');
  result.identifier = get(questionnaireResponse, 'identifier[0].value', '');
  result.status = get(questionnaireResponse, 'status', '');
  result.id = get(questionnaireResponse, 'id', '');
  result.identifier = get(questionnaireResponse, 'identifier[0].value', '');

  if(has(questionnaireResponse), 'authored'){
    result.authored = moment(get(questionnaireResponse, 'authored')).format("YYYY-MM-DD HH:mm");
  }

  if(Array.isArray(questionnaireResponse.item)){
    result.count = result.numItems = questionnaireResponse.item.length;
  }

  if(get(questionnaireResponse, "issue[0].details.text")){
    result.operationOutcome = get(questionnaireResponse, "issue[0].details.text");
  }
  
  return result;
}

export function flattenRestriction(restriction, internalDateFormat){
    let result = {
        resourceType: 'Restriction',
        _id: document._id,
        id: get(document, 'id', ''),
        dateTime: moment(get(document, 'dateTime', null)).format("YYYY-MM-DD hh:mm:ss"),
        status: get(document, 'status', ''),
        scope: get(document, 'scope.coding[0].display'),
        category: '',        
        policyUri: get(document, 'policy[0].uri', ''),
        provisionType: get(document, 'provision.type', ''),
        provisionActor: get(document, 'provision.actor[0].reference.display', '')
    };

    if(has(document, 'category[0].text')){
        result.category = get(document, 'category[0].text')
    } else {
        result.category = get(document, 'category[0].coding[0].display', '')
    }
    
    return result;
}

export function flattenRiskAssessment(document){
  let result = {
    _id: get(document, '_id', ''),
    id: get(document, 'id', ''),
    occurrenceDateTime: moment(get(document, 'occurrenceDateTime', null)).format("YYYY-MM-DD hh:mm"),
    identifier: get(document, 'identifier[0].value', ''),
    performer: get(document, 'performer.display', ''),
    performerReference: get(document, 'performer.reference', ''),
    status: get(document, 'status', ''),
    subjectReference: get(document, 'subject.reference', ''),
    subjectName: get(document, 'subject.display', ''),
    outcomeText: get(document, 'prediction[0].outcome.text', ''),
    probabilityDecimal: get(document, 'prediction[0].probabilityDecimal', ''),
    text: get(document, 'text.div', ''),
  };

  return result;
}

export function flattenServiceRequest(document){
  let result = {
    _id: get(document, '_id', ''),
    id: get(document, 'id', ''),
    identifier: get(document, 'identifier[0].value', ''),
    authoredOn: moment(get(document, 'authoredOn', null)).format("YYYY-MM-DD"),
    status: get(document, 'status', ''),
    intent: get(document, 'intent', ''),
    subjectReference: get(document, 'subject.reference', ''),
    subjectName: get(document, 'subject.display', ''),
    performer: get(document, 'performer[0].display', ''),
    performerReference: get(document, 'performer[0].reference', ''),
    orderDetail: get(document, 'orderDetail[0].text', ''),
    requestor: get(document, 'requestor[0].display', ''),
    requestorReference: get(document, 'requestor[0].reference', ''),
    locationReference: get(document, 'locationReference[0].name', ''),
    text: get(document, 'text.div', ''),
  };

  return result;
}

export function flattenSearchParameter(parameters, internalDateFormat){
  let result = {
    _id: '',
    id: '',
    meta: '',
    url: '',
    version: '',
    name: '',
    status: '',
    experimental: '',
    date: '',
    publisher: '',
    description: '',
    useContext: '',
    jurisdiction: '',
    code: '',
    base: '',
    type: '',
    expression: '',
    xpath: '',
    xpathUsage: '',
    target: '',
    multipleOr: '',
    multipleAnd: '',
    comparator: '',
    modifier: '',
    chain: ''
  };

  result.resourceType = get(parameters, 'resourceType', "Unknown");

  if(!internalDateFormat){
    internalDateFormat = get(Meteor, "settings.public.defaults.internalDateFormat", "YYYY-MM-DD");
  }

  result._id =  get(parameters, 'id') ? get(parameters, 'id') : get(parameters, '_id');
  result.id = get(parameters, 'id', '');

  result.url = get(parameters, 'url', '');
  result.version = get(parameters, 'version', '');
  result.name = get(parameters, 'name', '');
  result.status = get(parameters, 'status', '');
  result.experimental = get(parameters, 'experimental', false);
  result.date = moment(get(parameters, 'date', '')).format("YYYY-MM-DD");
  result.publisher = get(parameters, 'publisher', '');

  result.contact = get(parameters, 'contact[0].name', '');
  result.description = get(parameters, 'description', '');
  result.purpose = get(parameters, 'purpose', '');

  result.code = get(parameters, 'code', '');
  result.base = get(parameters, 'base.0', '');
  result.type = get(parameters, 'type', '');
  result.expression = get(parameters, 'expression', '');
  result.xpath = get(parameters, 'xpath', '');
  result.xpathUsage = get(parameters, 'xpathUsage', '');
  result.target = get(parameters, 'target', '');
  result.multipleOr = get(parameters, 'multipleOr', false);
  result.multipleAnd = get(parameters, 'multipleAnd', false);
  result.comparator = get(parameters, 'comparator', '');
  result.modifier = get(parameters, 'modifier', '');
  result.chain = get(parameters, 'chain', '');

  return result;
}

export function flattenStructureDefinition(definition, internalDateFormat){
  let result = {
    _id: '',
    id: '',
    meta: '',
    url: '',
    version: '',
    name: '',
    status: '',
    experimental: '',
    date: '',
    publisher: '',
    contact: '',
    description: '',
    jurisdiction: '',
    purpose: '',
    copyright: '',
    fhirVersion: '',
    kind: '',
    abstract: '',
    type: '',
    derivation: ''
  };

  result.resourceType = get(definition, 'resourceType', "Unknown");

  if(!internalDateFormat){
    internalDateFormat = get(Meteor, "settings.public.defaults.internalDateFormat", "YYYY-MM-DD");
  }

  result._id =  get(definition, 'id') ? get(definition, 'id') : get(definition, '_id');
  result.id = get(definition, 'id', '');

  result.url = get(definition, 'url', '');
  result.version = get(definition, 'version', '');
  result.name = get(definition, 'name', '');
  result.status = get(definition, 'status', '');
  result.experimental = get(definition, 'experimental', false);
  result.date = moment(get(definition, 'date', '')).format("YYYY-MM-DD");
  result.publisher = get(definition, 'publisher', '');

  result.contact = get(definition, 'contact[0].name', '');
  result.description = get(definition, 'description', '');
  result.purpose = get(definition, 'purpose', '');
  result.copyright = get(definition, 'copyright', '');
  result.fhirVersion = get(definition, 'fhirVersion', '');
  result.kind = get(definition, 'kind', '');
  result.abstract = get(definition, 'abstract', false);
  result.type = get(definition, 'type', '');
  result.derivation = get(definition, 'derivation', '');

  return result;
}


export function flattenSubscription(document){
  let result = {
    _id: get(document, '_id', ''),
    id: get(document, 'id', ''),
    status: get(document, 'status', ''),
    contact: get(document, 'contact[0].value', ''),
    end: "",
    reason: get(document, 'reason', ''),
    critera: get(document, 'critera', ''),
    error: get(document, 'error', ''),
    channelType: get(document, 'channel.type', ''),
    channelEndpoint: get(document, 'channel.endpoint', '')
  };

  if(get(document, 'end')){
    result.end = moment(get(document, 'end', '')).format("YYYY-MM-DD hh:mm");
  } else {
    result.end ="No end date specified."
  }

  return result;
}

export function flattenTask(task, internalDateFormat){
  let result = {
    _id: '',
    meta: '',
    identifier: '',
    publisher: '',
    status: '',
    title: '',
    authoredOn: '',
    lastModified: '',
    focus: '',
    for: '',
    intent: '',
    priority: '',
    code: '',
    requester: '',
    requesterReference: '',
    encounter: '',
    encounterReference: '',
    owner: '',
    ownerReference: '',
    operationOutcome: ''
  };

  result.resourceType = get(task, 'resourceType', "Unknown");

  if(!internalDateFormat){
    internalDateFormat = get(Meteor, "settings.public.defaults.internalDateFormat", "YYYY-MM-DD");
  }

  result._id =  get(task, 'id') ? get(task, 'id') : get(task, '_id');
  result.id = get(task, 'id', '');
  result.identifier = get(task, 'identifier[0].value', '');

  if(get(task, 'authoredOn')){
    result.authoredOn = moment(get(task, 'authoredOn', '')).format(internalDateFormat);
  }
  if(get(task, 'lastModified')){
    result.lastModified = moment(get(task, 'lastModified', '')).format(internalDateFormat);
  }

  result.description = get(task, 'description', '');
  result.status = get(task, 'status', '');
  result.businessStatus = get(task, 'businessStatus.coding[0].display', '');
  result.intent = get(task, 'intent', '');
  result.priority = get(task, 'priority', '');
  result.focus = get(task, 'focus.display', '');
  result.for = get(task, 'for.display', '');
  result.requester = get(task, 'requester.display', '');
  result.code = get(task, 'code.text', '');

  result.requester = get(task, 'requester.display', '');
  result.requesterReference = get(task, 'requester.reference', '');
  result.encounter = get(task, 'encounter.display', '');
  result.encounterReference = get(task, 'encounter.reference', '');
  result.owner = get(task, 'owner.display', '');
  result.ownerReference = get(task, 'owner.reference', '');

  if(get(task, "issue[0].details.text")){
    result.operationOutcome = get(task, "issue[0].details.text");
  }

  return result;
}

export function flattenValueSet(valueSet, internalDateFormat){
  let result = {
    _id: '',
    meta: '',
    identifier: '',
    title: '',
    operationOutcome: ''
  };

  result.resourceType = get(valueSet, 'resourceType', "Unknown");

  if(!internalDateFormat){
    internalDateFormat = get(Meteor, "settings.public.defaults.internalDateFormat", "YYYY-MM-DD");
  }

  result._id =  get(valueSet, 'id') ? get(valueSet, 'id') : get(valueSet, '_id');
  result.id = get(valueSet, 'id', '');
  result.identifier = get(valueSet, 'identifier[0].value', '');
  result.title = get(valueSet, 'title', '');

  if(get(valueSet, "issue[0].details.text")){
    result.operationOutcome = get(valueSet, "issue[0].details.text");
  }

  return result;
}

export function flattenVerificationResult(example, internalDateFormat){
    let result = {
      resourceType: 'VerificationResult',
      _id: '',
      id: '',
      target: '',
      need: '',
      status: '',
      statusDate: '',
      validationType: '',
      validationProcess: '',
      lastPerformed: '',
      nextScheduled: '',

      primarySourceWho: '',
      primarySourceType: '',
      primarySourceCommunicationMethod: '',
      primarySourceValidationStatus: '',
      primarySourceValidationDate: '',

      attestationWho: '',
      attestationOnBehalfOf: '',
      attestationCommunicationMethod: '',
      attestationDate: '',

      attestationSourceCert: '',
      attestationProxyCert: '',
      attestationSourceSignature: '',
      attestationProxySignature: '',

      validatorOrgDisplay: '',
      validatorIdentityCert: '',
      validatorAttestationSignature: ''
    };

    result.resourceType = get(example, 'resourceType', "VerificationResult");
    result._id = get(example, '_id');
    result.id = get(example, 'id');
  
    if(!internalDateFormat){
        internalDateFormat = get(Meteor, "settings.public.defaults.internalDateFormat", "YYYY-MM-DD");
    }
    result.statusDate = moment(get(example, 'statusDate')).format(internalDateFormat);
    result.lastPerformed = moment(get(example, 'lastPerformed')).format(internalDateFormat);
    result.nextScheduled = moment(get(example, 'nextScheduled')).format(internalDateFormat);
    
    result.target = get(example, 'target.display');
    result.targetLocation = get(example, 'targetLocation[0]');
    result.need = get(example, 'need.text');
    result.status = get(example, 'status');

    result.validationType = get(example, 'validationType.text');
    result.validationProcess = get(example, 'validationProcess[0].text');

    result.primarySource = get(example, 'primarySource[0].who.display');
    result.primarySourceType = get(example, 'primarySource[0].type[0].text');
    result.primarySourceCommunicationMethod = get(example, 'primarySource[0].communicationMethod[0].text');
    result.primarySourceValidationStatus = get(example, 'primarySource[0].validationStatus[0].text');
    result.primarySourceValidationDate = get(example, 'primarySource[0].validationDate');

    result.attestationWho = get(example, 'attestation[0].who.display');
    result.attestationOnBehalfOf = get(example, 'attestation[0].onBehalfOf.display');
    result.attestationCommunicationMethod = get(example, 'attestation[0].communicationMethod.text');
    result.attestationDate = get(example, 'attestation[0].date');

    result.attestationSourceCert = get(example, 'attestation[0].sourceIdentityCertificate');
    result.attestationProxyCert = get(example, 'attestation[0].proxyIdentityCertificate');
    result.attestationSourceSignature = get(example, 'attestation[0].sourceSignature');
    result.attestationProxySignature = get(example, 'attestation[0].proxySignature');

    result.validatorOrgDisplay = get(example, 'validator[0].organization.display');
    result.validatorIdentityCert = get(example, 'validator[0].identityCertificate');
    result.validatorAttestationSignature = get(example, 'validator[0].attestationSignature.data');

    return result;
}



export function flatten(collectionName, resource){
  console.log('Flattening record ' + resource.id + ' from the ' + collectionName + ' collection.');
  
  let notImplementedMessage = {text: "Not implemented  ."};
  switch (collectionName) {    
    case "AllergyIntollerances":
      return flattenAllergyIntolerance(resource);
    case "AuditEvents":
      return flattenAuditEvent(resource);
    case "Bundles":
      return flattenBundle(resource);
    case "CarePlans":
      return flattenCarePlan(resource);
    case "CareTeams":
      return flattenCareTeam(resource);
    case "CodeSystems":
      return flattenCodeSystem(resource);
    case "Conditions":
      return flattenCondition(resource);
    case "Consents":
      return flattenConsent(resource);
    case "Claims":
      return notImplementedMessage;
    case "ClinicalDocuments":
      return notImplementedMessage;
    case "Communications":
      return flattenCommunication(resource);
    case "CommunicationResponses":
      return flattenCommunicationResponse(resource);
    case "CommunicationRequests":
      return flattenCommunicationRequest(resource);
    case "Contracts":
      return notImplementedMessage;
    case "ClinicalImpressionss":
      return notImplementedMessage;
    case "Communications":
      return flattenCommunication(resource)
    case "Devices":
      return flattenDevice(resource);
    case "DiagnosticReports":
      return flattenDiagnosticReport(resource);
    case "DocumentReference":
      return flattenDocumentReference(resource);
    case "Encounters":
      return flattenEncounter(resource);
    case "Goals":
      return notImplementedMessage;          
    case "Immunizations":
      return flattenImmunization(resource);          
    case "ImagingStudies":
      return notImplementedMessage;     
    case "Lists":
      return flattenList(resource);   
    case "Locations":
      return flattenLocation(resource);
    case "HospitalLocations":
      return flattenLocation(resource);
    case "Measures":
      return flattenMeasure(resource);
    case "MeasureReports":
      return flattenMeasureReport(resource);
    case "Medications":
      return flattenMedication(resource);    
    case "MedicationOrders":
      return flattenMedicationOrder(resource);
    case "MedicationStatements":
      return flattenMedicationStatement(resource);
    case "MedicationRequests":
      return notImplementedMessage;     
    case "Observations":
      return flattenObservation(resource);
    case "Organizations":
      return flattenOrganization(resource);
    case "Patients":
      return flattenPatient(resource);
    case "Persons":
      return notImplementedMessage;        
    case "Practitioners":
      return flattenPractitioner(resource);
    case "Procedures":
      return flattenProcedure(resource);
    case "Provenances":
      return flattenProvenance(resource);
    case "Questionnaires":
      return flattenQuestionnaire(resource);     
    case "QuestionnaireResponses":
      return flattenQuestionnaireResponse(resource);     
    case "RiskAssessments":
      return flattenRiskAssessment(resource);     
    case "Sequences":
      return notImplementedMessage;     
    case "SearchParameters":
      return flattenSearchParameter(resource);           
    case "ServiceRequest":
      return flattenServiceRequest(resource);           
    case "StructureDefinitions":
      return flattenStructureDefinition(resource);  
    case "Subscriptions":
      return flattenSubscription(resource);        
    case "Tasks":
      return flattenTask(resource);
    case "ValueSets":
      return flattenValueSet(resource);
    default:
      break;
  }
}

export function lookupReference(referenceString){
  
  let result = null;
  let resourceBase = FhirUtilities.pluckReferenceBase(referenceString);

  if(typeof window[FhirUtilities.pluralizeResourceName(resourceBase)] === "object"){
    result = window[FhirUtilities.pluralizeResourceName(resourceBase)].findOne({id: FhirUtilities.pluckReferenceId(referenceString)});
  }
  
  return result;
}
export function lookupReferenceName(referenceString){
  
  let result = "";
  let resourceBase = FhirUtilities.pluckReferenceBase(referenceString);
  // console.log('resourceBase', resourceBase);

  if(typeof window[FhirUtilities.pluralizeResourceName(resourceBase)] === "object"){
    // console.log(FhirUtilities.pluralizeResourceName(resourceBase) + " Count: " + window[FhirUtilities.pluralizeResourceName(resourceBase)].find().count());

    let resolvedRecord = window[FhirUtilities.pluralizeResourceName(resourceBase)].findOne({id: FhirUtilities.pluckReferenceId(referenceString)});

    if(resolvedRecord){
      // console.log('resolvedRecord', resolvedRecord)
      if(typeof resolvedRecord.name === "string"){
        result = get(resolvedRecord, 'name');
      } else if (Array.isArray(resolvedRecord.name)){
        result = FhirUtilities.assembleName(resolvedRecord.name[0])
      } else {
        result = referenceString;
      }
    }
  }
  
  return result;
}

export const FhirDehydrator = {
  dehydrateAllergyIntolerance: flattenAllergyIntolerance,
  dehydrateAuditEvent: flattenAuditEvent,
  dehydrateBundle: flattenBundle,
  dehydrateCarePlan: flattenCarePlan,
  dehydrateCareTeam: flattenCareTeam,
  dehydrateCodeSystem: flattenCodeSystem,
  dehydrateComposition: flattenComposition,
  dehydrateCommunication: flattenCommunication,
  dehydrateConsent: flattenConsent,
  dehydrateCommunicationRequest: flattenCommunicationRequest,
  dehydrateCommunicationResponse: flattenCommunicationResponse,
  dehydrateCondition: flattenCondition,
  dehydrateDevice: flattenDevice,
  dehydrateDiagnosticReport: flattenDiagnosticReport,
  dehydrateDocumentReference: flattenDocumentReference,
  dehydrateEncounter: flattenEncounter,
  dehydrateEndpoint: flattenEndpoint,
  dehydrateHealthcareService: flattenHealthcareService,
  dehydrateImmunization: flattenImmunization,
  dehydrateInsurancePlan: flattenInsurancePlan,
  dehydrateList: flattenList,
  dehydrateLocation: flattenLocation,
  dehydrateMeasureReport: flattenMeasureReport,
  dehydrateMeasure: flattenMeasure,
  dehydrateMedication: flattenMedication,
  dehydrateMedicationOrder: flattenMedicationOrder,
  dehydrateMedicationStatement: flattenMedicationStatement,
  dehydrateNetwork: flattenNetwork,
  dehydrateObservation: flattenObservation,
  dehydrateOrganization: flattenOrganization,
  dehydrateOrganizationAffiliation: function(input){
    let flattenedInput = flattenOrganizationAffiliation(input);
    let result = Object.assign({}, flattenedInput);

    result.organization = lookupReferenceName(get(flattenedInput, 'organization'));
    result.network = lookupReferenceName(get(flattenedInput, 'network'));
    result.location = lookupReferenceName(get(flattenedInput, 'location'));
    result.healthcareService = lookupReferenceName(get(flattenedInput, 'healthcareService'));

    return result
  },
  dehydratePatient: flattenPatient,
  dehydratePractitioner: flattenPractitioner,
  dehydratePractitionerRole: function(input){
    let flattenedInput = flattenPractitionerRole(input);
    let result = Object.assign({}, flattenedInput);

    result.practitioner = lookupReferenceName(get(flattenedInput, 'practitioner'));
    result.organization = lookupReferenceName(get(flattenedInput, 'organization'));
    result.location = lookupReferenceName(get(flattenedInput, 'location'));
    result.healthcareService = lookupReferenceName(get(flattenedInput, 'healthcareService'));

    return result
  },
  dehydrateProcedure: flattenProcedure,
  dehydrateProvenance: flattenProvenance,
  dehydrateQuestionnaire: flattenQuestionnaire,
  dehydrateQuestionnaireResponse: flattenQuestionnaireResponse,
  dehydrateRestriction: flattenRestriction,
  dehydrateRiskAssessment: flattenRiskAssessment,
  dehydrateSearchParameter: flattenSearchParameter,
  dehydrateServiceRequest: flattenServiceRequest,
  dehydrateStructureDefinition: flattenStructureDefinition,
  dehydrateSubscription: flattenSubscription,
  dehydrateTask: flattenTask,
  dehydrateValueSet: flattenValueSet,
  dehydrateVerificationResult: flattenVerificationResult,
  flatten: flatten
}

export default {
  FhirDehydrator,
  lookupReference,
  lookupReferenceName,
  flattenAllergyIntolerance,
  flattenAuditEvent,
  flattenBundle,
  flattenCarePlan,
  flattenCareTeam,
  flattenCodeSystem,
  flattenComposition,
  flattenCondition,
  flattenConsent,
  flattenCommunication,
  flattenCommunicationRequest,
  flattenCommunicationResponse,
  flattenDevice,
  flattenDiagnosticReport,
  flattenDocumentReference,
  flattenEncounter,
  flattenEndpoint,
  flattenHealthcareService,
  flattenImmunization,
  flattenInsurancePlan,
  flattenList,
  flattenLocation,
  flattenMeasureReport,
  flattenMeasure,
  flattenMedication,
  flattenMedicationOrder,
  flattenMedicationStatement,
  flattenObservation,
  flattenOrganization,
  flattenOrganizationAffiliation,
  flattenPatient,
  flattenPractitioner,
  flattenPractitionerRole,
  flattenProcedure,
  flattenProvenance,
  flattenQuestionnaire,
  flattenQuestionnaireResponse,
  flattenRestriction,
  flattenRiskAssessment,
  flattenSearchParameter,
  flattenServiceRequest,
  flattenStructureDefinition,
  flattenSubscription,
  flattenTask,
  flattenValueSet,
  flattenVerificationResult,
  flatten
}

