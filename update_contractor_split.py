import re

with open('frontend/src/screens/contractor/ContractorDashboard.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Split into Covered Projects and Paysheet
paysheet_pattern = r'\{/\*\s*Projects Covered Section\s*\*/\}(.*?)\{/\*\s*Automated Paysheet \(App Calculated\):\s*\*/\}'
# Actually let's just find the whole section and replace it.

search_pattern = r'\{/\*\s*Projects Covered Section\s*\*/\}(.*?)\<Text style=\{styles\.profileSectionTitle\}\>Automated Paysheet \(App Calculated\):\</Text\>'

replacement = '''{/* Covered Projects Section */}
          <View style={[styles.profileSection, { marginBottom: 20 }]}>
            <Text style={[styles.profileSectionTitle, { fontSize: 14, marginBottom: 8 }]}>?? Covered projects ({completedJobs.length}):</Text>
            {completedJobs.length === 0 ? (
              <Text style={{ color: '#64748B', fontSize: 12, paddingLeft: 8 }}>No covered projects found.</Text>
            ) : (
              completedJobs.map(c => {
                const status = getStatusConfig(c.status);
                return (
                  <View key={c._id + "_cov"} style={styles.jobItemRow}>
                    <View style={styles.jobItemHeader}>
                      <View style={styles.addressCol}>
                        <Text style={{ fontWeight: '800', color: Colors.secondary, fontSize: 13, marginBottom: 2 }} numberOfLines={1}>
                          {c.customerName || 'Private Customer'} {c.customerName && c.customerName.startsWith('Freelance') ? '[Freelance]' : ''}
                        </Text>
                        <Text style={styles.addressText} numberOfLines={1}>?? {c.address}</Text>
                        <Text style={styles.timeRangeText}>
                          ?? {new Date(c.startTime).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
                        <Text style={[styles.statusBadgeText, { color: status.color }]}>{status.label}</Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {/* Automated Paysheet Section */}
          <View style={[styles.profileSection, { zIndex: 10 }]}>
            <Text style={styles.profileSectionTitle}>Automated Paysheet (App Calculated):</Text>'''

content = re.sub(search_pattern, replacement, content, flags=re.DOTALL)

with open('frontend/src/screens/contractor/ContractorDashboard.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated ContractorDashboard.js")
