## **2. Create New Directory and Settings Component**

**Create:** `frontend/src/components/settings/Settings.js`
Action: file_editor view /app/frontend/src/components/settings/Settings.js
Observation: /app/frontend/src/components/settings/Settings.js:
1|import React, { useState, useEffect } from 'react';
2|import { useAuth } from '../../context/AuthContext';
3|import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
4|import { Badge } from '../ui/badge';
5|import { Button } from '../ui/button';
6|import { Input } from '../ui/input';
7|import { Label } from '../ui/label';
8|import { Textarea } from '../ui/textarea';
9|import { Switch } from '../ui/switch';
10|import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
11|import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
12|import { 
13|  User, 
14|  Shield, 
15|  Bell, 
16|  Palette,
17|  Key,
18|  Download,
19|  Upload,
20|  Settings as SettingsIcon,
21|  Wallet,
22|  Link,
23|  Database,
24|  AlertTriangle,
25|  CheckCircle,
26|  Save,
27|  RefreshCw,
28|  Eye,
29|  EyeOff
30|} from 'lucide-react';
31|import { formatCurrency, formatDate } from '../../lib/utils';
32|import { dealerAPI } from '../../services/api';
33|import { useToast } from '../../hooks/use-toast';
34|
35|const Settings = () => {
36|  const { dealer, updateDealer } = useAuth();
37|  const { toast } = useToast();
38|  const [isLoading, setIsLoading] = useState(false);
39|  const [showApiKey, setShowApiKey] = useState(false);
40|  const [isSaving, setIsSaving] = useState(false);
41|  
42|  // Profile settings
43|  const [profileData, setProfileData] = useState({
44|    name: '',
45|    email: '',
46|    phone: '',
47|    address: '',
48|    website: '',
49|    description: ''
50|  });
51|
52|  // Notification settings
53|  const [notificationSettings, setNotificationSettings] = useState({
54|    emailNotifications: true,
55|    pushNotifications: true,
56|    complianceAlerts: true,
57|    paymentReminders: true,
58|    auditNotifications: true,
59|    marketingEmails: false,
60|    weeklyReports: true,
61|    monthlyReports: true
62|  });
63|
64|  // Security settings
65|  const [securitySettings, setSecuritySettings] = useState({
66|    twoFactorAuth: false,
67|    loginAlerts: true,
68|    apiAccess: true,
69|    sessionTimeout: '30',
70|    ipWhitelist: ''
71|  });
72|
73|  // System preferences
74|  const [systemPreferences, setSystemPreferences] = useState({
75|    theme: 'dark',
76|    language: 'en',
77|    timezone: 'UTC',
78|    dateFormat: 'MM/DD/YYYY',
79|    currency: 'USD',
80|    autoRefresh: true,
81|    compactMode: false
82|  });
83|
84|  // Integration settings
85|  const [integrationSettings, setIntegrationSettings] = useState({
86|    webhookUrl: '',
87|    apiKey: 'anvl_sk_test_1234567890abcdef',
88|    enableWebhooks: false,
89|    webhookEvents: {
90|      loans: true,
91|      vehicles: true,
92|      audits: true,
93|      payments: true
94|    }
95|  });
96|
97|  useEffect(() => {
98|    if (dealer) {
99|      setProfileData({
100|        name: dealer.name || '',
101|        email: dealer.email || '',
102|        phone: dealer.phone || '',
103|        address: dealer.address || '',
104|        website: dealer.website || '',
105|        description: dealer.description || ''
106|      });
107|    }
108|  }, [dealer]);
109|
110|  const handleSaveProfile = async () => {
111|    if (!dealer?.id) return;
112|    
113|    setIsSaving(true);
114|    try {
115|      await dealerAPI.updateDealer(dealer.id, profileData);
116|      updateDealer({ ...dealer, ...profileData });
117|      toast({
118|        title: "Profile updated",
119|        description: "Your profile information has been saved successfully.",
120|      });
121|    } catch (error) {
122|      toast({
123|        title: "Error",
124|        description: "Failed to update profile. Please try again.",
125|        variant: "destructive",
126|      });
127|    } finally {
128|      setIsSaving(false);
129|    }
130|  };
131|
132|  const handleSaveNotifications = async () => {
133|    setIsSaving(true);
134|    try {
135|      // Mock API call for notifications
136|      await new Promise(resolve => setTimeout(resolve, 1000));
137|      toast({
138|        title: "Notifications updated",
139|        description: "Your notification preferences have been saved.",
140|      });
141|    } catch (error) {
142|      toast({
143|        title: "Error",
144|        description: "Failed to update notifications. Please try again.",
145|        variant: "destructive",
146|      });
147|    } finally {
148|      setIsSaving(false);
149|    }
150|  };
151|
152|  const handleSaveSecurity = async () => {
153|    setIsSaving(true);
154|    try {
155|      // Mock API call for security settings
156|      await new Promise(resolve => setTimeout(resolve, 1000));
157|      toast({
158|        title: "Security updated",
159|        description: "Your security settings have been saved.",
160|      });
161|    } catch (error) {
162|      toast({
163|        title: "Error",
164|        description: "Failed to update security settings. Please try again.",
165|        variant: "destructive",
166|      });
167|    } finally {
168|      setIsSaving(false);
169|    }
170|  };
171|
172|  const handleSaveIntegrations = async () => {
173|    setIsSaving(true);
174|    try {
175|      // Mock API call for integration settings
176|      await new Promise(resolve => setTimeout(resolve, 1000));
177|      toast({
178|        title: "Integrations updated",
179|        description: "Your integration settings have been saved.",
180|      });
181|    } catch (error) {
182|      toast({
183|        title: "Error",
184|        description: "Failed to update integrations. Please try again.",
185|        variant: "destructive",
186|      });
187|    } finally {
188|      setIsSaving(false);
189|    }
190|  };
191|
192|  const handleGenerateApiKey = () => {
193|    const newApiKey = 'anvl_sk_live_' + Math.random().toString(36).substr(2, 32);
194|    setIntegrationSettings(prev => ({ ...prev, apiKey: newApiKey }));
195|    toast({
196|      title: "API Key generated",
197|      description: "New API key has been generated. Please save your settings.",
198|    });
199|  };
200|
201|  const handleExportData = () => {
202|    toast({
203|      title: "Export started",
204|      description: "Your data export is being prepared. You'll receive an email when it's ready.",
205|    });
206|  };
207|
208|  if (isLoading) {
209|    return (
210|      <div className="w-full max-w-7xl mx-auto">
211|        <div className="text-center py-12">
212|          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
213|          <p className="mt-4 text-gray-400">Loading settings...</p>
214|        </div>
215|      </div>
216|    );
217|  }
218|
219|  return (
220|    <div className="w-full max-w-7xl mx-auto space-y-6">
221|      {/* Header */}
222|      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
223|        <div>
224|          <h1 className="text-2xl lg:text-3xl font-bold text-white">Settings</h1>
225|          <p className="text-gray-400 mt-1">Manage your account, preferences, and integrations</p>
226|        </div>
227|        <div className="flex items-center gap-2">
228|          <Badge variant="outline" className="text-green-400 border-green-400">
229|            <CheckCircle className="h-3 w-3 mr-1" />
230|            Account Active
231|          </Badge>
232|        </div>
233|      </div>
234|
235|      {/* Settings Tabs */}
236|      <Tabs defaultValue="profile" className="w-full">
237|        <TabsList className="grid w-full grid-cols-5 bg-gray-900 border border-gray-800">
238|          <TabsTrigger value="profile" className="text-white data-[state=active]:bg-blue-600">Profile</TabsTrigger>
239|          <TabsTrigger value="notifications" className="text-white data-[state=active]:bg-blue-600">Notifications</TabsTrigger>
240|          <TabsTrigger value="security" className="text-white data-[state=active]:bg-blue-600">Security</TabsTrigger>
241|          <TabsTrigger value="integrations" className="text-white data-[state=active]:bg-blue-600">Integrations</TabsTrigger>
242|          <TabsTrigger value="preferences" className="text-white data-[state=active]:bg-blue-600">Preferences</TabsTrigger>
243|        </TabsList>
244|
245|        <TabsContent value="profile" className="space-y-6">
246|          <Card className="bg-gray-900 border-gray-800">
247|            <CardHeader>
248|              <CardTitle className="text-white flex items-center gap-2">
249|                <User className="h-5 w-5" />
250|                Profile Information
251|              </CardTitle>
252|              <CardDescription className="text-gray-400">
253|                Update your business profile and contact information
254|              </CardDescription>
255|            </CardHeader>
256|            <CardContent className="space-y-4">
257|              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
258|                <div className="space-y-2">
259|                  <Label htmlFor="name" className="text-white">Business Name</Label>
260|                  <Input
261|                    id="name"
262|                    value={profileData.name}
263|                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
264|                    className="bg-gray-800 border-gray-700 text-white"
265|                  />
266|                </div>
267|                <div className="space-y-2">
268|                  <Label htmlFor="email" className="text-white">Email Address</Label>
269|                  <Input
270|                    id="email"
271|                    type="email"
272|                    value={profileData.email}
273|                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
274|                    className="bg-gray-800 border-gray-700 text-white"
275|                  />
276|                </div>
277|                <div className="space-y-2">
278|                  <Label htmlFor="phone" className="text-white">Phone Number</Label>
279|                  <Input
280|                    id="phone"
281|                    value={profileData.phone}
282|                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
283|                    className="bg-gray-800 border-gray-700 text-white"
284|                  />
285|                </div>
286|                <div className="space-y-2">
287|                  <Label htmlFor="website" className="text-white">Website</Label>
288|                  <Input
289|                    id="website"
290|                    value={profileData.website}
291|                    onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
292|                    className="bg-gray-800 border-gray-700 text-white"
293|                  />
294|                </div>
295|              </div>
296|              <div className="space-y-2">
297|                <Label htmlFor="address" className="text-white">Address</Label>
298|                <Input
299|                  id="address"
300|                  value={profileData.address}
301|                  onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
302|                  className="bg-gray-800 border-gray-700 text-white"
303|                />
304|              </div>
305|              <div className="space-y-2">
306|                <Label htmlFor="description" className="text-white">Business Description</Label>
307|                <Textarea
308|                  id="description"
309|                  value={profileData.description}
310|                  onChange={(e) => setProfileData(prev => ({ ...prev, description: e.target.value }))}
311|                  className="bg-gray-800 border-gray-700 text-white"
312|                  rows={4}
313|                />
314|              </div>
315|              <div className="pt-4">
316|                <Button 
317|                  onClick={handleSaveProfile}
318|                  disabled={isSaving}
319|                  className="bg-blue-600 hover:bg-blue-700 text-white"
320|                >
321|                  {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
322|                  Save Profile
323|                </Button>
324|              </div>
325|            </CardContent>
326|          </Card>
327|
328|          {/* Wallet Information */}
329|          <Card className="bg-gray-900 border-gray-800">
330|            <CardHeader>
331|              <CardTitle className="text-white flex items-center gap-2">
332|                <Wallet className="h-5 w-5" />
333|                Wallet Information
334|              </CardTitle>
335|              <CardDescription className="text-gray-400">
336|                Your connected wallet and financial information
337|              </CardDescription>
338|            </CardHeader>
339|            <CardContent className="space-y-4">
340|              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
341|                <div className="space-y-2">
342|                  <Label className="text-white">Wallet Address</Label>
343|                  <div className="flex items-center gap-2">
344|                    <Input
345|                      value={dealer?.walletAddress || ''}
346|                      readOnly
347|                      className="bg-gray-800 border-gray-700 text-white"
348|                    />
349|                    <Badge variant="outline" className="text-green-400 border-green-400">
350|                      <CheckCircle className="h-3 w-3 mr-1" />
351|                      Connected
352|                    </Badge>
353|                  </div>
354|                </div>
355|                <div className="space-y-2">
356|                  <Label className="text-white">KYC Status</Label>
357|                  <div className="flex items-center gap-2">
358|                    <Input
359|                      value={dealer?.kycStatus || 'Pending'}
360|                      readOnly
361|                      className="bg-gray-800 border-gray-700 text-white"
362|                    />
363|                    <Badge variant="outline" className="text-green-400 border-green-400">
364|                      <CheckCircle className="h-3 w-3 mr-1" />
365|                      Approved
366|                    </Badge>
367|                  </div>
368|                </div>
369|              </div>
370|              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
371|                <div className="space-y-2">
372|                  <Label className="text-white">ANVL Tokens</Label>
373|                  <Input
374|                    value={dealer?.anvilTokens || 0}
375|                    readOnly
376|                    className="bg-gray-800 border-gray-700 text-white"
377|                  />
378|                </div>
379|                <div className="space-y-2">
380|                  <Label className="text-white">Total Loaned</Label>
381|                  <Input
382|                    value={formatCurrency(dealer?.totalLoaned || 0, 'USDC')}
383|                    readOnly
384|                    className="bg-gray-800 border-gray-700 text-white"
385|                  />
386|                </div>
387|                <div className="space-y-2">
388|                  <Label className="text-white">ACH Connected</Label>
389|                  <div className="flex items-center gap-2">
390|                    <Input
391|                      value={dealer?.achConnected ? 'Yes' : 'No'}
392|                      readOnly
393|                      className="bg-gray-800 border-gray-700 text-white"
394|                    />
395|                    <Badge variant="outline" className="text-green-400 border-green-400">
396|                      <CheckCircle className="h-3 w-3 mr-1" />
397|                      Connected
398|                    </Badge>
399|                  </div>
400|                </div>
401|              </div>
402|            </CardContent>
403|          </Card>
404|        </TabsContent>
405|
406|        <TabsContent value="notifications" className="space-y-6">
407|          <Card className="bg-gray-900 border-gray-800">
408|            <CardHeader>
409|              <CardTitle className="text-white flex items-center gap-2">
410|                <Bell className="h-5 w-5" />
411|                Notification Preferences
412|              </CardTitle>
413|              <CardDescription className="text-gray-400">
414|                Choose how you want to receive notifications and alerts
415|              </CardDescription>
416|            </CardHeader>
417|            <CardContent className="space-y-4">
418|              <div className="space-y-6">
419|                <div className="space-y-4">
420|                  <h3 className="text-lg font-medium text-white">General Notifications</h3>
421|                  <div className="space-y-3">
422|                    <div className="flex items-center justify-between">
423|                      <div className="space-y-1">
424|                        <Label className="text-white">Email Notifications</Label>
425|                        <p className="text-sm text-gray-400">Receive notifications via email</p>
426|                      </div>
427|                      <Switch
428|                        checked={notificationSettings.emailNotifications}
429|                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
430|                      />
431|                    </div>
432|                    <div className="flex items-center justify-between">
433|                      <div className="space-y-1">
434|                        <Label className="text-white">Push Notifications</Label>
435|                        <p className="text-sm text-gray-400">Receive browser push notifications</p>
436|                      </div>
437|                      <Switch
438|                        checked={notificationSettings.pushNotifications}
439|                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))}
440|                      />
441|                    </div>
442|                  </div>
443|                </div>
444|
445|                <div className="space-y-4">
446|                  <h3 className="text-lg font-medium text-white">Alert Types</h3>
447|                  <div className="space-y-3">
448|                    <div className="flex items-center justify-between">
449|                      <div className="space-y-1">
450|                        <Label className="text-white">Compliance Alerts</Label>
451|                        <p className="text-sm text-gray-400">Alerts for vehicle compliance issues</p>
452|                      </div>
453|                      <Switch
454|                        checked={notificationSettings.complianceAlerts}
455|                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, complianceAlerts: checked }))}
456|                      />
457|                    </div>
458|                    <div className="flex items-center justify-between">
459|                      <div className="space-y-1">
460|                        <Label className="text-white">Payment Reminders</Label>
461|                        <p className="text-sm text-gray-400">Reminders for upcoming payments</p>
462|                      </div>
463|                      <Switch
464|                        checked={notificationSettings.paymentReminders}
465|                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, paymentReminders: checked }))}
466|                      />
467|                    </div>
468|                    <div className="flex items-center justify-between">
469|                      <div className="space-y-1">
470|                        <Label className="text-white">Audit Notifications</Label>
471|                        <p className="text-sm text-gray-400">Notifications for NFC audit results</p>
472|                      </div>
473|                      <Switch
474|                        checked={notificationSettings.auditNotifications}
475|                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, auditNotifications: checked }))}
476|                      />
477|                    </div>
478|                  </div>
479|                </div>
480|
481|                <div className="space-y-4">
482|                  <h3 className="text-lg font-medium text-white">Reports</h3>
483|                  <div className="space-y-3">
484|                    <div className="flex items-center justify-between">
485|                      <div className="space-y-1">
486|                        <Label className="text-white">Weekly Reports</Label>
487|                        <p className="text-sm text-gray-400">Weekly performance summaries</p>
488|                      </div>
489|                      <Switch
490|                        checked={notificationSettings.weeklyReports}
491|                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, weeklyReports: checked }))}
492|                      />
493|                    </div>
494|                    <div className="flex items-center justify-between">
495|                      <div className="space-y-1">
496|                        <Label className="text-white">Monthly Reports</Label>
497|                        <p className="text-sm text-gray-400">Monthly analytics and insights</p>
498|                      </div>
499|                      <Switch
500|                        checked={notificationSettings.monthlyReports}
501|                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, monthlyReports: checked }))}
502|                      />
503|                    </div>
504|                    <div className="flex items-center justify-between">
505|                      <div className="space-y-1">
506|                        <Label className="text-white">Marketing Emails</Label>
507|                        <p className="text-sm text-gray-400">Product updates and marketing content</p>
508|                      </div>
509|                      <Switch
510|                        checked={notificationSettings.marketingEmails}
511|                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, marketingEmails: checked }))}
512|                      />
513|                    </div>
514|                  </div>
515|                </div>
516|              </div>
517|              <div className="pt-4">
518|                <Button 
519|                  onClick={handleSaveNotifications}
520|                  disabled={isSaving}
521|                  className="bg-blue-600 hover:bg-blue-700 text-white"
522|                >
523|                  {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
524|                  Save Notifications
525|                </Button>
526|              </div>
527|            </CardContent>
528|          </Card>
529|        </TabsContent>
530|
531|        <TabsContent value="security" className="space-y-6">
532|          <Card className="bg-gray-900 border-gray-800">
533|            <CardHeader>
534|              <CardTitle className="text-white flex items-center gap-2">
535|                <Shield className="h-5 w-5" />
536|                Security Settings
537|              </CardTitle>
538|              <CardDescription className="text-gray-400">
539|                Manage your account security and access controls
540|              </CardDescription>
541|            </CardHeader>
542|            <CardContent className="space-y-4">
543|              <div className="space-y-6">
544|                <div className="space-y-4">
545|                  <h3 className="text-lg font-medium text-white">Authentication</h3>
546|                  <div className="space-y-3">
547|                    <div className="flex items-center justify-between">
548|                      <div className="space-y-1">
549|                        <Label className="text-white">Two-Factor Authentication</Label>
550|                        <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
551|                      </div>
552|                      <Switch
553|                        checked={securitySettings.twoFactorAuth}
554|                        onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: checked }))}
555|                      />
556|                    </div>
557|                    <div className="flex items-center justify-between">
558|                      <div className="space-y-1">
559|                        <Label className="text-white">Login Alerts</Label>
560|                        <p className="text-sm text-gray-400">Get notified of new device logins</p>
561|                      </div>
562|                      <Switch
563|                        checked={securitySettings.loginAlerts}
564|                        onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, loginAlerts: checked }))}
565|                      />
566|                    </div>
567|                  </div>
568|                </div>
569|
570|                <div className="space-y-4">
571|                  <h3 className="text-lg font-medium text-white">API Access</h3>
572|                  <div className="space-y-3">
573|                    <div className="flex items-center justify-between">
574|                      <div className="space-y-1">
575|                        <Label className="text-white">API Access Enabled</Label>
576|                        <p className="text-sm text-gray-400">Allow API access to your account</p>
577|                      </div>
578|                      <Switch
579|                        checked={securitySettings.apiAccess}
580|                        onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, apiAccess: checked }))}
581|                      />
582|                    </div>
583|                    <div className="space-y-2">
584|                      <Label className="text-white">Session Timeout (minutes)</Label>
585|                      <Select value={securitySettings.sessionTimeout} onValueChange={(value) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: value }))}>
586|                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
587|                          <SelectValue />
588|                        </SelectTrigger>
589|                        <SelectContent>
590|                          <SelectItem value="15">15 minutes</SelectItem>
591|                          <SelectItem value="30">30 minutes</SelectItem>
592|                          <SelectItem value="60">1 hour</SelectItem>
593|                          <SelectItem value="120">2 hours</SelectItem>
594|                          <SelectItem value="0">No timeout</SelectItem>
595|                        </SelectContent>
596|                      </Select>
597|                    </div>
598|                    <div className="space-y-2">
599|                      <Label className="text-white">IP Whitelist</Label>
600|                      <Textarea
601|                        value={securitySettings.ipWhitelist}
602|                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, ipWhitelist: e.target.value }))}
603|                        placeholder="Enter IP addresses separated by commas"
604|                        className="bg-gray-800 border-gray-700 text-white"
605|                        rows={3}
606|                      />
607|                      <p className="text-sm text-gray-400">Leave empty to allow all IPs</p>
608|                    </div>
609|                  </div>
610|                </div>
611|              </div>
612|              <div className="pt-4">
613|                <Button 
614|                  onClick={handleSaveSecurity}
615|                  disabled={isSaving}
616|                  className="bg-blue-600 hover:bg-blue-700 text-white"
617|                >
618|                  {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
619|                  Save Security Settings
620|                </Button>
621|              </div>
622|            </CardContent>
623|          </Card>
624|        </TabsContent>
625|
626|        <TabsContent value="integrations" className="space-y-6">
627|          <Card className="bg-gray-900 border-gray-800">
628|            <CardHeader>
629|              <CardTitle className="text-white flex items-center gap-2">
630|                <Link className="h-5 w-5" />
631|                API Configuration
632|              </CardTitle>
633|              <CardDescription className="text-gray-400">
634|                Manage your API keys and webhook integrations
635|              </CardDescription>
636|            </CardHeader>
637|            <CardContent className="space-y-4">
638|              <div className="space-y-4">
639|                <div className="space-y-2">
640|                  <Label className="text-white">API Key</Label>
641|                  <div className="flex items-center gap-2">
642|                    <Input
643|                      type={showApiKey ? "text" : "password"}
644|                      value={integrationSettings.apiKey}
645|                      readOnly
646|                      className="bg-gray-800 border-gray-700 text-white"
647|                    />
648|                    <Button
649|                      variant="outline"
650|                      size="sm"
651|                      onClick={() => setShowApiKey(!showApiKey)}
652|                      className="bg-transparent border-gray-700 text-white hover:bg-gray-800"
653|                    >
654|                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
655|                    </Button>
656|                    <Button
657|                      variant="outline"
658|                      size="sm"
659|                      onClick={handleGenerateApiKey}
660|                      className="bg-transparent border-gray-700 text-white hover:bg-gray-800"
661|                    >
662|                      <RefreshCw className="h-4 w-4" />
663|                    </Button>
664|                  </div>
665|                  <p className="text-sm text-gray-400">Keep your API key secure and never share it publicly</p>
666|                </div>
667|                
668|                <div className="space-y-2">
669|                  <Label className="text-white">Webhook URL</Label>
670|                  <Input
671|                    value={integrationSettings.webhookUrl}
672|                    onChange={(e) => setIntegrationSettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
673|                    placeholder="https://your-domain.com/webhooks/anvl"
674|                    className="bg-gray-800 border-gray-700 text-white"
675|                  />
676|                </div>
677|
678|                <div className="flex items-center justify-between">
679|                  <div className="space-y-1">
680|                    <Label className="text-white">Enable Webhooks</Label>
681|                    <p className="text-sm text-gray-400">Receive real-time updates via webhooks</p>
682|                  </div>
683|                  <Switch
684|                    checked={integrationSettings.enableWebhooks}
685|                    onCheckedChange={(checked) => setIntegrationSettings(prev => ({ ...prev, enableWebhooks: checked }))}
686|                  />
687|                </div>
688|
689|                <div className="space-y-4">
690|                  <h3 className="text-lg font-medium text-white">Webhook Events</h3>
691|                  <div className="space-y-3">
692|                    <div className="flex items-center justify-between">
693|                      <div className="space-y-1">
694|                        <Label className="text-white">Loan Events</Label>
695|                        <p className="text-sm text-gray-400">Loan creation, updates, and payments</p>
696|                      </div>
697|                      <Switch
698|                        checked={integrationSettings.webhookEvents.loans}
699|                        onCheckedChange={(checked) => setIntegrationSettings(prev => ({ 
700|                          ...prev, 
701|                          webhookEvents: { ...prev.webhookEvents, loans: checked }
702|                        }))}
703|                      />
704|                    </div>
705|                    <div className="flex items-center justify-between">
706|                      <div className="space-y-1">
707|                        <Label className="text-white">Vehicle Events</Label>
708|                        <p className="text-sm text-gray-400">Vehicle updates, sales, and location changes</p>
709|                      </div>
710|                      <Switch
711|                        checked={integrationSettings.webhookEvents.vehicles}
712|                        onCheckedChange={(checked) => setIntegrationSettings(prev => ({ 
713|                          ...prev, 
714|                          webhookEvents: { ...prev.webhookEvents, vehicles: checked }
715|                        }))}
716|                      />
717|                    </div>
718|                    <div className="flex items-center justify-between">
719|                      <div className="space-y-1">
720|                        <Label className="text-white">Audit Events</Label>
721|                        <p className="text-sm text-gray-400">NFC audit results and compliance updates</p>
722|                      </div>
723|                      <Switch
724|                        checked={integrationSettings.webhookEvents.audits}
725|                        onCheckedChange={(checked) => setIntegrationSettings(prev => ({ 
726|                          ...prev, 
727|                          webhookEvents: { ...prev.webhookEvents, audits: checked }
728|                        }))}
729|                      />
730|                    </div>
731|                    <div className="flex items-center justify-between">
732|                      <div className="space-y-1">
733|                        <Label className="text-white">Payment Events</Label>
734|                        <p className="text-sm text-gray-400">Payment confirmations and failures</p>
735|                      </div>
736|                      <Switch
737|                        checked={integrationSettings.webhookEvents.payments}
738|                        onCheckedChange={(checked) => setIntegrationSettings(prev => ({ 
739|                          ...prev, 
740|                          webhookEvents: { ...prev.webhookEvents, payments: checked }
741|                        }))}
742|                      />
743|                    </div>
744|                  </div>
745|                </div>
746|              </div>
747|              <div className="pt-4">
748|                <Button 
749|                  onClick={handleSaveIntegrations}
750|                  disabled={isSaving}
751|                  className="bg-blue-600 hover:bg-blue-700 text-white"
752|                >
753|                  {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
754|                  Save Integration Settings
755|                </Button>
756|              </div>
757|            </CardContent>
758|          </Card>
759|        </TabsContent>
760|
761|        <TabsContent value="preferences" className="space-y-6">
762|          <Card className="bg-gray-900 border-gray-800">
763|            <CardHeader>
764|              <CardTitle className="text-white flex items-center gap-2">
765|                <Palette className="h-5 w-5" />
766|                System Preferences
767|              </CardTitle>
768|              <CardDescription className="text-gray-400">
769|                Customize your app experience and data settings
770|              </CardDescription>
771|            </CardHeader>
772|            <CardContent className="space-y-4">
773|              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
774|                <div className="space-y-2">
775|                  <Label className="text-white">Theme</Label>
776|                  <Select value={systemPreferences.theme} onValueChange={(value) => setSystemPreferences(prev => ({ ...prev, theme: value }))}>
777|                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
778|                      <SelectValue />
779|                    </SelectTrigger>
780|                    <SelectContent>
781|                      <SelectItem value="dark">Dark</SelectItem>
782|                      <SelectItem value="light">Light</SelectItem>
783|                      <SelectItem value="system">System</SelectItem>
784|                    </SelectContent>
785|                  </Select>
786|                </div>
787|                <div className="space-y-2">
788|                  <Label className="text-white">Language</Label>
789|                  <Select value={systemPreferences.language} onValueChange={(value) => setSystemPreferences(prev => ({ ...prev, language: value }))}>
790|                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
791|                      <SelectValue />
792|                    </SelectTrigger>
793|                    <SelectContent>
794|                      <SelectItem value="en">English</SelectItem>
795|                      <SelectItem value="es">Spanish</SelectItem>
796|                      <SelectItem value="fr">French</SelectItem>
797|                    </SelectContent>
798|                  </Select>
799|                </div>
800|                <div className="space-y-2">
801|                  <Label className="text-white">Timezone</Label>
802|                  <Select value={systemPreferences.timezone} onValueChange={(value) => setSystemPreferences(prev => ({ ...prev, timezone: value }))}>
803|                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
804|                      <SelectValue />
805|                    </SelectTrigger>
806|                    <SelectContent>
807|                      <SelectItem value="UTC">UTC</SelectItem>
808|                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
809|                      <SelectItem value="America/Chicago">Central Time</SelectItem>
810|                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
811|                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
812|                    </SelectContent>
813|                  </Select>
814|                </div>
815|                <div className="space-y-2">
816|                  <Label className="text-white">Date Format</Label>
817|                  <Select value={systemPreferences.dateFormat} onValueChange={(value) => setSystemPreferences(prev => ({ ...prev, dateFormat: value }))}>
818|                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
819|                      <SelectValue />
820|                    </SelectTrigger>
821|                    <SelectContent>
822|                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
823|                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
824|                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
825|                    </SelectContent>
826|                  </Select>
827|                </div>
828|              </div>
829|
830|              <div className="space-y-4">
831|                <h3 className="text-lg font-medium text-white">Display Options</h3>
832|                <div className="space-y-3">
833|                  <div className="flex items-center justify-between">
834|                    <div className="space-y-1">
835|                      <Label className="text-white">Auto Refresh</Label>
836|                      <p className="text-sm text-gray-400">Automatically refresh data every 30 seconds</p>
837|                    </div>
838|                    <Switch
839|                      checked={systemPreferences.autoRefresh}
840|                      onCheckedChange={(checked) => setSystemPreferences(prev => ({ ...prev, autoRefresh: checked }))}
841|                    />
842|                  </div>
843|                  <div className="flex items-center justify-between">
844|                    <div className="space-y-1">
845|                      <Label className="text-white">Compact Mode</Label>
846|                      <p className="text-sm text-gray-400">Use compact layout for better data density</p>
847|                    </div>
848|                    <Switch
849|                      checked={systemPreferences.compactMode}
850|                      onCheckedChange={(checked) => setSystemPreferences(prev => ({ ...prev, compactMode: checked }))}
851|                    />
852|                  </div>
853|                </div>
854|              </div>
855|
856|              <div className="pt-4">
857|                <Button 
858|                  onClick={() => toast({ title: "Preferences saved", description: "Your preferences have been updated." })}
859|                  className="bg-blue-600 hover:bg-blue-700 text-white"
860|                >
861|                  <Save className="h-4 w-4 mr-2" />
862|                  Save Preferences
863|                </Button>
864|              </div>
865|            </CardContent>
866|          </Card>
867|
868|          {/* Data Management */}
869|          <Card className="bg-gray-900 border-gray-800">
870|            <CardHeader>
871|              <CardTitle className="text-white flex items-center gap-2">
872|                <Database className="h-5 w-5" />
873|                Data Management
874|              </CardTitle>
875|              <CardDescription className="text-gray-400">
876|                Export your data and manage account information
877|              </CardDescription>
878|            </CardHeader>
879|            <CardContent className="space-y-4">
880|              <div className="space-y-4">
881|                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
882|                  <div>
883|                    <h4 className="text-white font-medium">Export Data</h4>
884|                    <p className="text-sm text-gray-400">Download all your dealership data</p>
885|                  </div>
886|                  <Button 
887|                    onClick={handleExportData}
888|                    variant="outline"
889|                    className="bg-transparent border-gray-700 text-white hover:bg-gray-800"
890|                  >
891|                    <Download className="h-4 w-4 mr-2" />
892|                    Export
893|                  </Button>
894|                </div>
895|                
896|                <div className="flex items-center justify-between p-4 bg-red-900/20 border border-red-700 rounded-lg">
897|                  <div>
898|                    <h4 className="text-white font-medium">Danger Zone</h4>
899|                    <p className="text-sm text-gray-400">Permanently delete your account and all data</p>
900|                  </div>
901|                  <Button 
902|                    variant="destructive"
903|                    className="bg-red-600 hover:bg-red-700 text-white"
904|                  >
905|                    <AlertTriangle className="h-4 w-4 mr-2" />
906|                    Delete Account
907|                  </Button>
908|                </div>
909|              </div>
910|            </CardContent>
911|          </Card>
912|        </TabsContent>
913|      </Tabs>
914|    </div>
915|  );
916|};
917|
918|export default Settings;
