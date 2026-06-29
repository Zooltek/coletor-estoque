export class MetricsExporter {
  static exportJSON(snapshot, timeline) {
    const payload = {
      exportedAt: new Date().toISOString(),
      snapshot,
      timeline
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    this._downloadFile(dataStr, `diagnostics_${Date.now()}.json`);
  }

  static exportTXT(snapshot, timeline) {
    let content = `=== AMURA COLLECTOR DIAGNOSTICS ===\nData: ${new Date().toLocaleString()}\n\n`;
    content += `--- SNAPSHOT ---\n${JSON.stringify(snapshot, null, 2)}\n\n`;
    content += `--- TIMELINE (${timeline.length} eventos) ---\n`;
    
    timeline.forEach(e => {
      content += `[${new Date(e.timestamp).toLocaleTimeString()}] [${e.type}] ${e.message}\n`;
    });

    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(content);
    this._downloadFile(dataStr, `diagnostics_${Date.now()}.txt`);
  }

  static _downloadFile(dataStr, filename) {
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }
}
