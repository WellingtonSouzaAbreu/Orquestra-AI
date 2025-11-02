# AI Chat CRUD Operations - Complete Guide

## 🎯 Overview

The AI chat now supports **full CRUD operations** (Create, Read, Update, Delete) across all pages! You can manage your entire organization structure through natural conversation.

## ✨ What's New

- ✅ **CREATE** - Add new items via chat (already working)
- ✅ **UPDATE** - Modify existing items via chat (NEW!)
- ✅ **DELETE** - Remove items via chat (NEW!)
- ✅ **READ** - AI has context of all items

## 📋 Operations by Page

---

### 1. **Base** (Organizational Pillars)

#### CREATE Pillar
```
You: "Add a pillar called Innovation"
You: "Create a pillar named Customer Focus"
→ New pillar card appears ✨
```

#### UPDATE Pillar
```
You: "Update the Innovation pillar description to focus on AI"
→ Innovation pillar description updates ✨

You: "Rename Excellence pillar to Quality Excellence"
→ Pillar name changes ✨

You: "Change the Customer Focus description"
→ Description updates ✨
```

#### DELETE Pillar
```
You: "Delete the Innovation pillar"
You: "Remove the Excellence pillar"
→ Pillar card disappears ✨
```

---

### 2. **Áreas** (Organization Areas)

#### CREATE Area
```
You: "Create a Marketing area"
You: "Add an IT area"
→ New area card appears ✨
```

#### UPDATE Area
```
You: "Update Marketing area description to digital marketing"
→ Marketing description updates ✨

You: "Rename IT area to Information Technology"
→ Area name changes ✨

You: "Change the Sales area description"
→ Description updates ✨
```

#### DELETE Area
```
You: "Delete the Marketing area"
You: "Remove the Finance area"
→ Area card disappears (includes warning about associated items) ✨
```

---

### 3. **KPIs** (Performance Indicators)

**Note:** Must have an area selected in the right sidebar

#### CREATE KPI
```
You: "Add a KPI for conversion rate"
You: "Create a customer satisfaction KPI"
→ New KPI card appears in selected area ✨
```

#### UPDATE KPI
```
You: "Update the Conversion Rate KPI description"
→ KPI description updates ✨

You: "Rename Revenue KPI to Monthly Revenue"
→ KPI name changes ✨

You: "Change the Customer Satisfaction description to include NPS"
→ Description updates ✨
```

#### DELETE KPI
```
You: "Delete the Revenue KPI"
You: "Remove the Conversion Rate KPI"
→ KPI card disappears ✨
```

---

### 4. **Tarefas** (Tasks)

**Note:** Must have an area selected in the right sidebar

#### CREATE Task
```
You: "Create a task to send monthly newsletter"
You: "Add a task for social media posting"
→ New task card appears in selected area ✨
```

#### UPDATE Task
```
You: "Update the newsletter task to be weekly"
→ Task name and description update ✨

You: "Rename 'Send Report' task to 'Generate Weekly Report'"
→ Task name changes ✨

You: "Change the social media task description"
→ Description updates ✨
```

#### DELETE Task
```
You: "Delete the newsletter task"
You: "Remove the reporting task"
→ Task card disappears ✨
```

---

### 5. **Processos** (Workflow Activities)

**Note:** Must have an area selected in the right sidebar

#### CREATE Process
```
You: "Add a requirements analysis activity in planning"
You: "Create testing activity in execution"
→ New activity card appears in specified stage ✨
```

#### UPDATE Process
```
You: "Move code review to execution stage"
→ Activity moves to execution column ✨

You: "Update testing description to include integration tests"
→ Activity description updates ✨

You: "Rename deployment to production deployment"
→ Activity name changes ✨

You: "Change testing activity to delivery stage"
→ Activity moves to different column ✨
```

#### DELETE Process
```
You: "Delete the deployment activity"
You: "Remove the code review activity"
→ Activity card disappears ✨
```

---

## 🎨 Example Conversations

### Complete Area Management
```
📍 Base Page

You: "Add Innovation pillar"
AI: "I'll add Innovation as a pillar..."
→ Innovation pillar appears

You: "Update Innovation description to focus on AI and ML"
AI: "I'll update the Innovation pillar..."
→ Description changes

You: "Rename Innovation to AI Innovation"
AI: "I'll rename the pillar..."
→ Name changes

You: "Delete the AI Innovation pillar"
AI: "I'll delete the pillar..."
→ Pillar removed
```

### Managing KPIs
```
📍 KPIs Page (Marketing area selected)

You: "Add conversion rate KPI"
AI: "I'll add a conversion rate KPI..."
→ New KPI appears

You: "Add engagement rate KPI"
→ Another KPI appears

You: "Update conversion rate description to include all channels"
AI: "I'll update the description..."
→ Description changes

You: "Delete the engagement rate KPI"
AI: "I'll delete the KPI..."
→ KPI removed
```

### Building and Modifying Workflow
```
📍 Processos Page (Engineering area selected)

You: "Add requirements gathering in planning"
→ Activity appears in Planning column

You: "Add code review in planning"
→ Another activity in Planning

You: "Move code review to execution"
AI: "I'll move code review..."
→ Activity moves to Execution column

You: "Update code review description"
AI: "I'll update it..."
→ Description changes

You: "Delete the requirements gathering activity"
AI: "I'll delete it..."
→ Activity removed
```

---

## 💡 Tips for Best Results

### Identifying Items
The AI identifies items by **name** (case-insensitive):
- ✅ "Update the Innovation pillar"
- ✅ "Delete Marketing area"
- ✅ "Rename Conversion Rate KPI"

### Being Specific
For updates, specify what to change:
- ✅ "Update Revenue KPI description"
- ✅ "Rename Marketing to Digital Marketing"
- ✅ "Move testing to delivery stage"

### Natural Language Works
You can use various phrasings:
- ✅ "Delete the Innovation pillar"
- ✅ "Remove Innovation pillar"
- ✅ "Get rid of the Innovation pillar"

All work the same way!

### One Operation at a Time
Best practice:
- ✅ "Update Marketing area"
- ✅ Then: "Now update Sales area"

Less reliable:
- ⚠️ "Update Marketing and Sales areas"

---

## 🔍 How It Works

### Update Operations

**What you can update:**
1. **Name** (rename the item)
2. **Description** (change the description)
3. **Both** (rename and change description)
4. **Stage** (for processes only - move between columns)

**Examples:**
```json
// Rename only
{"action": "update_kpi", "data": {"name": "Revenue", "newName": "Monthly Revenue"}}

// Update description only
{"action": "update_kpi", "data": {"name": "Revenue", "description": "New description"}}

// Both
{"action": "update_kpi", "data": {"name": "Revenue", "newName": "MRR", "description": "Monthly recurring revenue"}}

// Change stage (processes)
{"action": "update_process", "data": {"name": "Testing", "stage": "delivery"}}
```

### Delete Operations

**What happens:**
- Item is found by name (case-insensitive)
- Item is removed from database
- UI updates immediately
- Associated data may also be removed (e.g., deleting an area removes its KPIs)

**Safety:**
- AI warns about cascading deletes
- You can undo by recreating the item manually

---

## 🚨 Important Notes

### Item Identification
- Items are identified by **name**
- Matching is **case-insensitive**
- "Innovation" = "innovation" = "INNOVATION"

### What Can't Be Updated via Chat
- Organization ID (technical field)
- Creation dates (historical data)
- Item relationships (handled automatically)

### Deletion Warnings
When deleting areas, the AI will mention:
> "Note that all associated KPIs, tasks, and processes will also be removed."

### Manual Override
You can always use the UI buttons for:
- More control over edits
- Seeing current values
- Confirmation dialogs

---

## 📊 Complete Operation Matrix

| Page | CREATE | UPDATE | DELETE |
|------|--------|--------|--------|
| **Início** | Org info | Org info | ❌ |
| **Base** | ✅ Pillars | ✅ Pillars | ✅ Pillars |
| **Áreas** | ✅ Areas | ✅ Areas | ✅ Areas |
| **KPIs** | ✅ KPIs | ✅ KPIs | ✅ KPIs |
| **Tarefas** | ✅ Tasks | ✅ Tasks | ✅ Tasks |
| **Processos** | ✅ Activities | ✅ Activities | ✅ Activities |

✅ = Fully supported via AI chat

---

## 🎯 Common Use Cases

### Quick Corrections
```
You: "Add Inovation pillar"
→ Pillar created with typo

You: "Rename Inovation to Innovation"
→ Fixed! ✨
```

### Iterative Refinement
```
You: "Add Revenue KPI"
→ Basic KPI created

You: "Update Revenue description to track monthly recurring revenue"
→ More detailed ✨

You: "Rename Revenue to MRR"
→ More professional ✨
```

### Restructuring
```
You: "Add testing in planning"
→ Created in wrong stage

You: "Move testing to execution"
→ Fixed! ✨
```

### Cleanup
```
You: "Delete all the test data"
AI: "I can delete items one at a time. Which item first?"

You: "Delete Test Area"
→ Removed

You: "Delete Test Pillar"
→ Removed
```

---

## 🛠 Troubleshooting

### "Item not found"
- Check spelling of item name
- Verify you're on the correct page
- Make sure the item actually exists

### Update didn't work
- Be specific about what to update
- Use item's current exact name
- Check console for warnings

### Delete removed wrong item
- Items are matched by name
- Be specific with names
- Use unique names for items

### Update changed wrong field
- Specify which field: "update description" or "rename to"
- AI interprets context, be clear

---

## ✨ Pro Tips

1. **Use descriptive names** - Makes updates easier
2. **Be explicit** - "Rename X to Y" is clearer than "Change X"
3. **One thing at a time** - Better results
4. **Check the UI** - Verify changes happened
5. **Use chat for speed** - Use UI for precision

---

## 🎉 Benefits

✅ **Faster edits** - No need to open modals
✅ **Natural workflow** - Just talk to the AI
✅ **Bulk operations** - Multiple updates in sequence
✅ **Undo via chat** - "Delete X", then "Create X again"
✅ **Learn as you go** - AI guides you through operations

---

**Ready to manage your data via chat?** Try updating and deleting items on any page! 🚀
