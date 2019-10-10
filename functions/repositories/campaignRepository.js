const { Firestore } = require("@google-cloud/firestore");
const firestore = new Firestore();
const campaignRef = firestore.collection("campaigns");

async function onCouponUpdated (couponId, updatedCodeList, updatedCouponType) {
    const batch = firestore.batch();
    const campaignDocs = await campaignRef.where("setting.coupons.id", "==", couponId).get();
    campaignDocs.docs.forEach(campaign => {
        let setting = campaign.data().setting;
        setting.coupons.codeList = updatedCodeList;
        setting.coupons.couponType = updatedCouponType;
        batch.update(campaign.ref, { setting });
    });

    await batch.commit();
}

module.exports = { onCouponUpdated };
