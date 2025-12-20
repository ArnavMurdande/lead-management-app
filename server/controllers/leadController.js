const Lead = require('../models/Lead');
const xlsx = require('xlsx');
const fs = require('fs');
const { logActivity } = require('../utils/logger'); 

// @desc    Get all leads (with Pagination, Filtering & Searching)
// @route   GET /api/leads
// @access  Private
exports.getLeads = async (req, res) => {
  try {
    const { 
      status, tags, search, assignedTo, startDate, endDate, 
      page = 1, limit = 10 
    } = req.query;

    let query = {};

    // 1. Role-based access
    if (req.user.role === 'support-agent') {
      query.assignedTo = req.user._id;
    } else if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    // 2. Filters
    if (status) query.status = status;
    if (tags) {
        const tagsArray = tags.split(',').map(tag => tag.trim());
        if (tagsArray.length > 0) query.tags = { $in: tagsArray };
    }

    // 3. Search (Name, Email, Phone, Source)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { source: { $regex: search, $options: 'i' } }
      ];
    }

    // 4. Date Range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // 5. Pagination Calculation
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute Query
    const leads = await Lead.find(query)
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

    // Get Total Count (for Frontend Pagination)
    const total = await Lead.countDocuments(query);

    res.json({
      leads,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new lead
// @route   POST /api/leads
// @access  Private
exports.createLead = async (req, res) => {
  try {
    // Auto-assign if creator is an agent
    const leadData = { ...req.body };
    if (req.user.role === 'support-agent') {
        leadData.assignedTo = req.user._id;
    }

    const lead = await Lead.create(leadData);

    // [LOGGING]
    await logActivity(req.user._id, 'CREATE_LEAD', `Created new lead: ${lead.name}`, req);

    res.status(201).json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a lead
// @route   PUT /api/leads/:id
// @access  Private
exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    // Permission Check
    if (req.user.role === 'support-agent' && lead.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedLead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('assignedTo', 'name');

    // [LOGGING]
    if (lead.status !== updatedLead.status) {
        await logActivity(req.user._id, 'UPDATE_STATUS', `Status changed to ${updatedLead.status} for ${updatedLead.name}`, req);
    } else {
        await logActivity(req.user._id, 'UPDATE_LEAD', `Updated details for ${updatedLead.name}`, req);
    }

    res.json(updatedLead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a lead
// @route   DELETE /api/leads/:id
// @access  Private (Admins only)
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    if (req.user.role === 'support-agent') {
      return res.status(403).json({ message: 'Not authorized to delete' });
    }

    const leadName = lead.name;
    await lead.deleteOne();

    // [LOGGING]
    await logActivity(req.user._id, 'DELETE_LEAD', `Deleted lead: ${leadName}`, req);

    res.json({ message: 'Lead removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a note
// @route   POST /api/leads/:id/note
// @access  Private
exports.addNote = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    const note = {
      text: req.body.text,
      author: req.user.name,
      date: Date.now()
    };

    lead.notes.push(note);
    await lead.save();

    // [LOGGING]
    await logActivity(req.user._id, 'ADD_NOTE', `Added note to ${lead.name}`, req);

    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Import leads from Excel
// @route   POST /api/leads/import
// @access  Private
exports.importLeads = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Read file from disk (DiskStorage)
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const leads = data.map(item => ({
      name: item.Name || item.name || 'Unknown',
      email: item.Email || item.email,
      phone: item.Phone || item.phone,
      source: item.Source || 'Import',
      status: 'New',
      tags: item.Tags ? item.Tags.split(',').map(t => t.trim()) : ['Imported']
    }));

    if (leads.length > 0) {
        await Lead.insertMany(leads);
        // [LOGGING]
        await logActivity(req.user._id, 'IMPORT_LEADS', `Imported ${leads.length} leads`, req);
    }

    // Cleanup: Delete uploaded file
    fs.unlinkSync(req.file.path);

    res.json({ message: 'Import successful', count: leads.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export leads to Excel
// @route   GET /api/leads/export
// @access  Private
exports.exportLeads = async (req, res) => {
  try {
    const { status, tags, search, assignedTo } = req.query;
    let query = {};
    
    // Role check
    if (req.user.role === 'support-agent') query.assignedTo = req.user._id;
    else if (assignedTo) query.assignedTo = assignedTo;

    // Filters (Same as GetLeads)
    if (status) query.status = status;
    if (tags) query.tags = { $in: tags.split(',') };
    if (search) {
       query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
       ];
    }

    const leads = await Lead.find(query).populate('assignedTo', 'name').lean();
    
    // Format data
    const data = leads.map(lead => ({
      ID: lead._id.toString(),
      Name: lead.name,
      Email: lead.email,
      Phone: lead.phone,
      Source: lead.source,
      Status: lead.status,
      Tags: lead.tags ? lead.tags.join(', ') : '',
      AssignedTo: lead.assignedTo ? lead.assignedTo.name : 'Unassigned',
      Created: lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '',
      NotesCount: lead.notes ? lead.notes.length : 0
    }));

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, 'Leads_Export');
    
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    // [LOGGING]
    await logActivity(req.user._id, 'EXPORT_LEADS', `Exported ${leads.length} leads`, req);

    res.setHeader('Content-Disposition', 'attachment; filename="leads.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/leads/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Total Count
    const totalLeads = await Lead.countDocuments();
    
    // 2. Status Distribution (Pie Chart)
    const statusDistribution = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // 3. Agent Performance (Bar Chart)
    const agentPerformance = await Lead.aggregate([
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'agent' } },
      { $unwind: { path: '$agent', preserveNullAndEmptyArrays: true } },
      { $project: { name: '$agent.name', count: 1 } }
    ]);

    // 4. Recent Leads
    const recentLeads = await Lead.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('assignedTo', 'name');

    res.json({
      totalLeads,
      statusDistribution,
      agentPerformance,
      recentLeads
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};