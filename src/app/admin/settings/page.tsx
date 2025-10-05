"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/useToast";
import { Save, RefreshCw, AlertTriangle } from "lucide-react";

export default function AdminSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // System settings state
  const [systemSettings, setSystemSettings] = useState({
    siteName: "Questly",
    siteDescription: "Interactive quiz platform",
    maintenanceMode: false,
    allowRegistration: true,
    maxQuizzesPerUser: 50,
    maxQuestionsPerQuiz: 20,
    defaultQuizTime: 30,
  });

  // Email settings state
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "noreply@questly.com",
    fromName: "Questly Team",
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    requireEmailVerification: true,
    allowPasswordReset: true,
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    enableTwoFactor: false,
  });

  const handleSave = async (section: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: `${section} settings saved successfully!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all settings to default?")) {
      // Reset to default values
      setSystemSettings({
        siteName: "Questly",
        siteDescription: "Interactive quiz platform",
        maintenanceMode: false,
        allowRegistration: true,
        maxQuizzesPerUser: 50,
        maxQuestionsPerQuiz: 20,
        defaultQuizTime: 30,
      });
      
      toast({
        title: "Settings Reset",
        description: "All settings have been reset to default values.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage system configuration and preferences</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>
            Configure basic system information and limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={systemSettings.siteName}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, siteName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Input
                id="siteDescription"
                value={systemSettings.siteDescription}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="maxQuizzesPerUser">Max Quizzes Per User</Label>
              <Input
                id="maxQuizzesPerUser"
                type="number"
                value={systemSettings.maxQuizzesPerUser}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, maxQuizzesPerUser: parseInt(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxQuestionsPerQuiz">Max Questions Per Quiz</Label>
              <Input
                id="maxQuestionsPerQuiz"
                type="number"
                value={systemSettings.maxQuestionsPerQuiz}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, maxQuestionsPerQuiz: parseInt(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultQuizTime">Default Quiz Time (minutes)</Label>
              <Input
                id="defaultQuizTime"
                type="number"
                value={systemSettings.defaultQuizTime}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, defaultQuizTime: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="maintenanceMode"
              checked={systemSettings.maintenanceMode}
              onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))}
            />
            <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="allowRegistration"
              checked={systemSettings.allowRegistration}
              onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, allowRegistration: checked }))}
            />
            <Label htmlFor="allowRegistration">Allow New User Registration</Label>
          </div>

          <Button onClick={() => handleSave("System")} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            Save System Settings
          </Button>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Email Settings</CardTitle>
          <CardDescription>
            Configure SMTP settings for email notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">SMTP Host</Label>
              <Input
                id="smtpHost"
                value={emailSettings.smtpHost}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                placeholder="smtp.gmail.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPort">SMTP Port</Label>
              <Input
                id="smtpPort"
                type="number"
                value={emailSettings.smtpPort}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="smtpUser">SMTP Username</Label>
              <Input
                id="smtpUser"
                value={emailSettings.smtpUser}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUser: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPassword">SMTP Password</Label>
              <Input
                id="smtpPassword"
                type="password"
                value={emailSettings.smtpPassword}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fromEmail">From Email</Label>
              <Input
                id="fromEmail"
                type="email"
                value={emailSettings.fromEmail}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromName">From Name</Label>
              <Input
                id="fromName"
                value={emailSettings.fromName}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, fromName: e.target.value }))}
              />
            </div>
          </div>

          <Button onClick={() => handleSave("Email")} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            Save Email Settings
          </Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>
            Configure security policies and authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="requireEmailVerification"
                checked={securitySettings.requireEmailVerification}
                onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, requireEmailVerification: checked }))}
              />
              <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="allowPasswordReset"
                checked={securitySettings.allowPasswordReset}
                onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, allowPasswordReset: checked }))}
              />
              <Label htmlFor="allowPasswordReset">Allow Password Reset</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="enableTwoFactor"
                checked={securitySettings.enableTwoFactor}
                onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, enableTwoFactor: checked }))}
              />
              <Label htmlFor="enableTwoFactor">Enable Two-Factor Authentication</Label>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={securitySettings.sessionTimeout}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                value={securitySettings.maxLoginAttempts}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          <Button onClick={() => handleSave("Security")} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            Save Security Settings
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
            <div>
              <h4 className="font-medium text-red-600">Clear All Data</h4>
              <p className="text-sm text-gray-600">
                Permanently delete all quizzes, users, and plays. This action cannot be undone.
              </p>
            </div>
            <Button variant="destructive" disabled>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Clear All Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
