define(['durandal/app', 'knockout', 'services/mock', 'plugins/router', 'contacts/listItem', 'contacts/edit', 'plugins/observable'],
function(app, ko, dataService, router, ListItem, ContactVM, observable) {
	function ContactListVM() {
		var self = this;

		self.contacts = dataService.getContacts()
			.then(function(contacts) {
				return contacts.map(function(contact) {
					return new ListItem(contact);
				});				
			});

		//
		//CRUD Operations

		self.newEntry = function() {
			new ContactVM().show()
				.then(function(newContact) {
					if (newContact)
						self.contacts.push(new ListItem(newContact));
				});
		};
		
		self.deleteContact = function(listItem) {
			var contact = listItem.contact;
			app.showMessage('Are you sure you want to delete ' + contact.displayName + '?', 'Delete Contact?', ['No', 'Yes'])
				.then(function(response) {
					if (response === 'Yes') {
						dataService.removeContact(contact.id).then(function() {
							self.contacts.remove(listItem);
						});
					}
				});
		};

		//
		//Searching
		self.query = '';
		self.clearQuery = function() { self.query = ''; };

		observable.defineProperty(self, 'displayContacts', function() {      
			//No query, just return everythying
			if (self.query === '')
				return self.contacts;
			var query = self.query.toLowerCase();
			//Otherwise, filter all contacts using the query
			return ko.utils.arrayFilter(self.contacts, function(item) {
				var c = item.contact;
				return c.displayName.toLowerCase().indexOf(query) !== -1
						// || c.firstName.toLowerCase().indexOf(query) !== -1
						// || c.lastName.toLowerCase().indexOf(query) !== -1
						// || c.nickName.toLowerCase().indexOf(query) !== -1            
						|| c.phoneNumber.toLowerCase().indexOf(query) !== -1;
			});
		}).extend({ 
			//We don't want queries updating the filter too quickly
			//Debounce on 100ms
			rateLimit: {
				timeout: 100,
				method: 'notifyWhenChangesStop'
			}
		});
	};

	return ContactListVM;
});