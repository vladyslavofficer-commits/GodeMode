// Контракт будущего адаптера. Реальные endpoint и схема авторизации не подтверждены.
export class MrktAdapter {
 async connect(){throw Error('MRKT integration is not configured');}
 async balance(){throw Error('MRKT integration is not configured');}
 async inventory(){throw Error('MRKT integration is not configured');}
 async listings(){throw Error('MRKT integration is not configured');}
 async freshListings(){throw Error('MRKT integration is not configured');}
 async floor(){throw Error('MRKT integration is not configured');}
 async placeOffer(){throw Error('Live trading is not implemented');}
 async cancelOffer(){throw Error('Live trading is not implemented');}
 async listGift(){throw Error('Live trading is not implemented');}
}
