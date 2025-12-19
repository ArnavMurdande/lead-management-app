const Lead = require('../models/Lead');
const xlsx = require('xlsx');
const fs = require('fs');

exports.getLeads = async (req, res) => {
  try {
    const { status, tags, search, assignedTo, startDate, endDate } = req.query;
    let query = {};

    // Role-based access
    if (req.user.role === 'support-agent') {
      query.assignedTo = req.user._id;
    } else if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    if (status) query.status = status;
    if (tags) query.tags = { $in: tags.split(',') };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const leads = await Lead.find(query).populate('assignedTo', 'name email').sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createLead = async (req, res) => {
  try {
    const lead = await Lead.create(req.body);
    res.status(201).json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    // Check permission
    if (req.user.role === 'support-agent' && lead.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this lead' });
    }

    const updatedLead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedLead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    // Only admins can delete
    if (req.user.role === 'support-agent') {
      return res.status(403).json({ message: 'Not authorized to delete leads' });
    }

    await lead.deleteOne();
    res.json({ message: 'Lead removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.importLeads = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    const leads = data.map(item => ({
      name: item.Name,
      email: item.Email,
      phone: item.Phone,
      source: item.Source || 'Imported',
      status: 'New'
    }));

    await Lead.insertMany(leads);
    fs.unlinkSync(req.file.path); // Clean up
    res.json({ message: 'Leads imported successfully', count: leads.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.exportLeads = async (req, res) => {
  try {
    // Re-use getLeads logic or similar filtering
    const { status, tags } = req.query;
    let query = {};
    if (status) query.status = status;
    if (tags) query.tags = { $in: tags.split(',') };
    
    // Role check for export? Maybe allow all for now or restrict
    if (req.user.role === 'support-agent') {
      query.assignedTo = req.user._id;
    }

    const leads = await Lead.find(query).lean();
    
    const data = leads.map(lead => ({
      Name: lead.name,
      Email: lead.email,
      Phone: lead.phone,
      Source: lead.source,
      Status: lead.status,
      Tags: lead.tags.join(', '),
      Created: lead.createdAt
    }));

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, 'Leads');
    
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Disposition', 'attachment; filename="leads.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    
    const statusDistribution = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const agentPerformance = await Lead.aggregate([
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'agent' } },
      { $unwind: { path: '$agent', preserveNullAndEmptyArrays: true } },
      { $project: { name: '$agent.name', count: 1 } }
    ]);

    const recentLeads = await Lead.find().sort({ createdAt: -1 }).limit(5).populate('assignedTo', 'name');

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
