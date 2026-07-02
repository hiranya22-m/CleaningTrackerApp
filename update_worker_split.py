import re

with open('frontend/src/screens/worker/WorkerDashboard.js', 'r', encoding='utf-8') as f:
    content = f.read()

search_pattern = r'\{/\*\s*3\. Projects covered \& Automated Paysheet\s*\*/\}(.*?)\<Text style=\{\[styles\.sectionTitle, \{ fontSize: 18, fontWeight: \'800\', marginBottom: 6, color: Colors\.primary \}\]\}\>?? Covered Projects \& Automated Paysheet\</Text\>'

replacement = '''{/* 3. Covered Projects (Separated) */}
                <View style={{ marginBottom: 20 }}>
                  <Text style={[styles.sectionTitle, { fontSize: 14, marginBottom: 8 }]}>?? Covered Projects ({
                    jobs.filter(j => j.contractor && (j.contractor._id || j.contractor).toString() === selectedContractor._id.toString() && j.status === 'completed').length
                  })</Text>
                  {(() => {
                    const completedJobsList = jobs.filter(j => j.contractor && (j.contractor._id || j.contractor).toString() === selectedContractor._id.toString() && j.status === 'completed');
                    if (completedJobsList.length === 0) {
                      return <Text style={{ color: '#64748B', fontSize: 12, paddingLeft: 8 }}>No covered projects found.</Text>;
                    }
                    return completedJobsList.map(job => {
                      const status = getStatusConfig(job.status);
                      return (
                        <View key={job._id + "_cov"} style={styles.jobItemRow}>
                          <View style={styles.jobItemHeader}>
                            <View style={styles.addressCol}>
                              <Text style={{ fontWeight: '800', color: Colors.secondary, fontSize: 13, marginBottom: 2 }} numberOfLines={1}>
                                {job.contractor?.companyName || job.contractor?.name || job.clientName || 'Private Customer'}
                              </Text>
                              <Text style={styles.addressText} numberOfLines={1}>?? {job.address}</Text>
                              <Text style={styles.timeRangeText}>
                                ?? {new Date(job.startTime).toLocaleDateString()}
                              </Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
                              <Text style={[styles.statusBadgeText, { color: status.color }]}>{status.label}</Text>
                            </View>
                          </View>
                        </View>
                      );
                    });
                  })()}
                </View>
                
                <View style={styles.divider} />

                {/* 4. Automated Paysheet */}
                <View style={{ zIndex: 10, marginTop: 15 }}>
                  <Text style={[styles.sectionTitle, { fontSize: 18, fontWeight: '800', marginBottom: 6, color: Colors.primary }]}>?? Automated Paysheet</Text>'''

content = re.sub(search_pattern, replacement, content, flags=re.DOTALL)

with open('frontend/src/screens/worker/WorkerDashboard.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated WorkerDashboard.js")
