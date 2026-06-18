import { Router } from 'express';
import { itineraryController } from '../controllers/itineraryController';

const router = Router({ mergeParams: true });

router.get('/', itineraryController.getItineraries);
router.get('/conflicts', itineraryController.checkConflicts);
router.post('/', itineraryController.createItinerary);
router.put('/:id', itineraryController.updateItinerary);
router.delete('/:id', itineraryController.deleteItinerary);
router.post('/:id/copy', itineraryController.copyItinerary);

export default router;
