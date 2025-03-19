const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Subscription = require('../models/subscription');

// GET all subscriptions
router.get('/', async (req, res) => {
  try {
    const subscriptions = await Subscription.find().sort({ nextBillingDate: 1 });
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// GET subscription by ID
router.get('/:id', async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// POST new subscription
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('cost').isNumeric().withMessage('Cost must be a number'),
  body('billingCycle').isIn(['monthly', 'yearly', 'weekly', 'quarterly']).withMessage('Invalid billing cycle'),
  body('nextBillingDate').isISO8601().withMessage('Invalid date format'),
  body('category').optional().isString(),
  body('description').optional().isString(),
  body('url').optional().isURL().withMessage('Invalid URL format')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const subscription = new Subscription(req.body);
    await subscription.save();
    res.status(201).json(subscription);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// PUT update subscription
router.put('/:id', [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('cost').optional().isNumeric().withMessage('Cost must be a number'),
  body('billingCycle').optional().isIn(['monthly', 'yearly', 'weekly', 'quarterly']).withMessage('Invalid billing cycle'),
  body('nextBillingDate').optional().isISO8601().withMessage('Invalid date format'),
  body('category').optional().isString(),
  body('description').optional().isString(),
  body('url').optional().isURL().withMessage('Invalid URL format')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

// DELETE subscription
router.delete('/:id', async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndDelete(req.params.id);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    res.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete subscription' });
  }
});

// GET subscription statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const totalSubscriptions = await Subscription.countDocuments();
    const totalMonthlyCost = await Subscription.aggregate([
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $cond: [
                { $eq: ['$billingCycle', 'monthly'] },
                '$cost',
                {
                  $cond: [
                    { $eq: ['$billingCycle', 'yearly'] },
                    { $divide: ['$cost', 12] },
                    {
                      $cond: [
                        { $eq: ['$billingCycle', 'weekly'] },
                        { $multiply: ['$cost', 4.33] },
                        { $multiply: ['$cost', 4] } // quarterly
                      ]
                    }
                  ]
                }
              ]
            }
          }
        }
      }
    ]);

    const upcomingRenewals = await Subscription.find({
      nextBillingDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
      }
    }).sort({ nextBillingDate: 1 }).limit(5);

    const categoryStats = await Subscription.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalCost: { $sum: '$cost' }
        }
      },
      { $sort: { totalCost: -1 } }
    ]);

    res.json({
      totalSubscriptions,
      totalMonthlyCost: totalMonthlyCost[0]?.total || 0,
      upcomingRenewals,
      categoryStats
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router; 