function Mock()
{
    //if (!device)
    //{
        document.addEventListener("deviceready", this.createContacts, false);
    //}
    //else
    //{
        this.init();
    //}   
};

Mock.prototype.init = function()
{
    device.msisdn = "+359888654321";
    SERVICE_BASE_URL = "http://mobilecryptochat.apphb.com/MobileCryptoChatService.svc/";
};

Mock.prototype.createContacts = function()
{
    mockedContacts = [];
    
    var contact1 = navigator.contacts.create();
    contact1.displayName = "Kristian Kirov";
    contact1.nickname = "Kristian Kirov";
    var phoneNumbers1 = [];
    phoneNumbers1[0] = new ContactField('mobile', '+359888654321', false);
    contact1.phoneNumbers = phoneNumbers1;
  
    contact1.save(function(c) { mockedContacts.push(c); });
    
    var contact2 = navigator.contacts.create();
    contact2.displayName = "Stoyan Ivanov";
    contact2.nickname = "Stoyan Ivanov";
    var phoneNumbers2 = [];
    phoneNumbers2[0] = new ContactField('mobile', '+359888654322', false);
    contact2.phoneNumbers = phoneNumbers2;
  
    contact2.save(function(c) { mockedContacts.push(c); });
};