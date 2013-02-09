function DataProvider()
{ }

DataProvider.prototype.joinNumbersWithPhoneBook = function(numbers, onReady, skipValue)
{
    var self = this;
    navigator.contacts.find(["displayName", "phoneNumbers"],
        function(contacts)
        {
            contacts = $.merge(contacts, mockedContacts);
            result = [];
            for (var i = 0; i < numbers.length; ++i)
            {
                var number = numbers[i];
                if (number == skipValue)
                {
                    continue;
                }
                var contact = self.getContactByNumber(number, contacts);
                if (contact)
                {
                    result.push({ text: contact.displayName, group: contact.displayName[0], number: number });
                }
                else
                {
                    result.push({ text: number, group: "Unknown", number: number });
                }
            }
            
            onReady(result);
        }
    );
};

DataProvider.prototype.getContactByNumber = function(number, contacts)
{
    for (var i = 0; i < contacts.length; ++i)
    {
        var contact = contacts[i];
		if (!contact.phoneNumbers) {
            continue;
		}
        var phoneNumbers = contact.phoneNumbers;
		for (var j = 0; j < phoneNumbers.length; ++j) {
            var contactNumber = phoneNumbers[j];
            if (contactNumber.value == number)
            {
                return contact;
            }
        }
    }
    
    return null;
};

DataProvider.prototype.findObjectInObservableArray = function(value, propertyName, collection)
{
    var count = collection.total();
    for (var i = 0; i < count; ++i)
    {
        var object = collection.at(i);
        if (object[propertyName] == value)
        {
            return object;
        }
    }
};

DataProvider.prototype.getChallengeData = function()
{
    return Math.floor((Math.random()*1000000000));
};

DataProvider.prototype.getChallengeKey = function(data, secretKey)
{
    return GibberishAES.enc(data, secretKey);
    
};

DataProvider.prototype.getRespondData = function(encriptedData, secretKey)
{
    return GibberishAES.dec(encriptionKey, secretKey);
    
};