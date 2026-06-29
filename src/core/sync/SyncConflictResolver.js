export class SyncConflictResolver {
  static resolve(clientData, serverData, strategy = 'server_wins') {
    switch(strategy) {
      case 'client_wins':
        return clientData;
      case 'server_wins':
      default:
        return serverData;
    }
  }
}
