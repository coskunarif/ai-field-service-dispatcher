import { test, expect } from '@playwright/test';

test.describe('Gainhelm Dual-Screen Sandbox Simulator E2E', () => {

  test('runs happy path dispatch simulation (accept job)', async ({ page }) => {
    // 1. Navigate to sandbox
    await page.goto('/sandbox');
    
    // 2. Assert page loaded and headers are visible
    await expect(page.locator('h1')).toContainText('Gainhelm AI Dispatch Simulator');
    await expect(page.locator('#phone-title')).toContainText('No Active Dispatch');
    
    // 3. Select Plumbing trade
    await page.selectOption('#trade-select', 'Plumbing');
    
    // 4. Assert the scenario template got populated
    const scenarioList = page.locator('#scenario-list');
    await expect(scenarioList.locator('.scenario-card').first()).toContainText('Burst Pipe');
    
    // Click on Burst Pipe scenario card
    await page.click('.scenario-card:has-text("Burst Pipe")');
    
    // Verify the textarea description gets updated
    const descTextarea = page.locator('#request-desc');
    await expect(descTextarea).toHaveValue(/Pipe burst/);
    
    // 5. Trigger the AI Dispatcher
    await page.click('#btn-trigger');
    
    // 6. Verify terminal logs print matching steps
    const terminal = page.locator('#terminal-feed');
    await expect(terminal).toContainText('Initiating agentic dispatch loop', { timeout: 8000 });
    await expect(terminal).toContainText('Intent classified: Trade = Plumbing', { timeout: 8000 });
    await expect(terminal).toContainText('Sarah Connor', { timeout: 8000 });
    
    // 7. Verify phone receives message and header is set to Sarah Connor
    await expect(page.locator('#phone-title')).toContainText('Sarah Connor', { timeout: 8000 });
    const phoneBody = page.locator('#phone-chat');
    await expect(phoneBody).toContainText('New emergency plumbing request', { timeout: 8000 });
    
    // 8. Click 'Accept Job (YES)' quick reply
    const yesBtn = page.locator('.quick-reply-btn:has-text("Accept Job (YES)")');
    await expect(yesBtn).toBeVisible({ timeout: 8000 });
    await yesBtn.click();
    
    // 9. Verify phone shows sent text and final confirmation
    await expect(phoneBody).toContainText('YES', { timeout: 8000 });
    await expect(phoneBody).toContainText('Job confirmed! Scheduled in Google Calendar', { timeout: 8000 });
    
    // 10. Verify terminal logs show successful calendar book and complete
    await expect(terminal).toContainText('Booking job to Google Calendar', { timeout: 8000 });
    await expect(terminal).toContainText('Dispatch cycle complete', { timeout: 8000 });
    
    // 11. Verify Wednesday calendar column contains the scheduled event
    const todayEvents = page.locator('#today-events-col');
    await expect(todayEvents).toContainText('Sarah Connor');
    await expect(todayEvents).toContainText('Emergency Plumbing');
  });

  test('runs escalation re-routing path (decline job)', async ({ page }) => {
    await page.goto('/sandbox');
    
    await page.selectOption('#trade-select', 'HVAC');
    await page.click('.scenario-card:has-text("Emergency AC Outage")');
    
    await page.click('#btn-trigger');
    
    const terminal = page.locator('#terminal-feed');
    const phoneBody = page.locator('#phone-chat');
    
    // Wait for phone header to show Sarah Connor
    await expect(page.locator('#phone-title')).toContainText('Sarah Connor', { timeout: 8000 });
    
    // Click 'Decline Job (BUSY)'
    const busyBtn = page.locator('.quick-reply-btn:has-text("Decline Job (BUSY)")');
    await expect(busyBtn).toBeVisible({ timeout: 8000 });
    await busyBtn.click();
    
    // Verify phone shows decline notification and switch to Dave
    await expect(phoneBody).toContainText('BUSY', { timeout: 8000 });
    await expect(phoneBody).toContainText('Re-routing', { timeout: 8000 });
    await expect(terminal).toContainText('Technician Sarah Connor declined', { timeout: 8000 });
    
    // Wait for David Miller switch
    await expect(page.locator('#phone-title')).toContainText('David Miller', { timeout: 8000 });
    await expect(phoneBody).toContainText('DAVID MILLER', { timeout: 8000 });
    await expect(phoneBody).toContainText('New emergency hvac request', { timeout: 8000 });
    
    // Dave gets only YES option
    const daveYesBtn = page.locator('.quick-reply-btn:has-text("Accept Job (YES)")');
    await expect(daveYesBtn).toBeVisible({ timeout: 8000 });
    await daveYesBtn.click();
    
    // Confirm scheduled
    await expect(phoneBody).toContainText('YES', { timeout: 8000 });
    await expect(phoneBody).toContainText('Job confirmed', { timeout: 8000 });
    await expect(terminal).toContainText('David Miller" at 123 Main St.', { timeout: 8000 });
    
    const todayEvents = page.locator('#today-events-col');
    await expect(todayEvents).toContainText('David Miller');
    await expect(todayEvents).toContainText('Emergency HVAC');
  });

});
