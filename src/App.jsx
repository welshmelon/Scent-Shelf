import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, setLogLevel } from 'firebase/firestore';

// --- INITIAL DATA ---
// Data structure updated to support multiple bottles. Quantities reset to full.
const today = '2025-07-13';
const initialPerfumes = [
    { id: '1', brand: 'Acampora Profumi', scent: 'Ou', price: 2.5, category: 'Full Bottle (Cool)', season: 'Cool Weather', rotationMonths: 'Nov, Jan', dayEvening: 'Evening', specialOccasion: true, topNotes: 'Oud, Floral Notes', middleNotes: 'Amber', baseNotes: 'Oud, Woody Notes', status: 'active', dateBought: today, bottles: [{ id: 'bottle_1', size: 50, currentLevel: 50 }] },
    { id: '2', brand: 'Acqua di Parma', scent: 'Fico di Amalfi', price: 1.21, category: 'Full Bottle (Warm)', season: 'Warm Weather', rotationMonths: 'Jul, Aug', dayEvening: 'Day', specialOccasion: false, topNotes: 'Bergamot, Lemon, Grapefruit', middleNotes: 'Fig Nectar, Pink Pepper', baseNotes: 'Fig Wood, Cedarwood', status: 'active', dateBought: today, bottles: [{ id: 'bottle_2', size: 75, currentLevel: 75 }] },
    { id: '3', brand: 'L\'Atelier Parfum', scent: 'Opus 1 - Exquise Tentation', price: 1.48, category: 'Full Bottle (Cool)', season: 'Cool Weather', rotationMonths: 'Oct, Nov', dayEvening: 'Evening', specialOccasion: false, topNotes: 'Pink Berries, Freesia', middleNotes: 'Praline, Vanilla', baseNotes: 'Iris, Tonka Bean', status: 'active', dateBought: today, bottles: [{ id: 'bottle_3', size: 50, currentLevel: 50 }] },
    { id: '4', brand: 'L\'Atelier Parfum', scent: 'Opus 2 - Tobacco Volute', price: 1.48, category: 'Full Bottle (Cool)', season: 'Cool Weather', rotationMonths: 'Nov, Jan', dayEvening: 'Evening', specialOccasion: true, topNotes: 'Tobacco Leaves, Sage', middleNotes: 'Cinnamon, Iris', baseNotes: 'Tonka Bean, Vanilla', status: 'active', dateBought: today, bottles: [{ id: 'bottle_4', size: 50, currentLevel: 50 }] },
    { id: '5', brand: 'Bastide', scent: 'Ambre Maquis', price: 1.25, category: 'Full Bottle (Cool)', season: 'Cool Weather', rotationMonths: 'Oct, Dec', dayEvening: 'Evening', specialOccasion: false, topNotes: 'Tangerine, Elemi', middleNotes: 'Labdanum, Patchouli', baseNotes: 'Sandalwood, Amber', status: 'active', dateBought: today, bottles: [{ id: 'bottle_5', size: 100, currentLevel: 100 }] },
    { id: '6', brand: 'BIBBI', scent: 'Bag of Now', price: 4.5, category: 'Travel/Sample', season: 'Cool Weather', rotationMonths: 'Oct, Nov', dayEvening: 'Evening', specialOccasion: true, topNotes: 'Saffron, Pink Pepper', middleNotes: 'Rose, Leather', baseNotes: 'Oud, Sandalwood', status: 'active', dateBought: today, bottles: [{ id: 'bottle_6', size: 10, currentLevel: 10 }] },
    { id: '7', brand: 'BIBBI', scent: 'Boy of June', price: 4.5, category: 'Travel/Sample', season: 'Cool Weather', rotationMonths: 'Sep, Oct', dayEvening: 'Day/Evening', specialOccasion: false, topNotes: 'Cherry, Freesia', middleNotes: 'Leather', baseNotes: 'Dark Woods, Musk', status: 'active', dateBought: today, bottles: [{ id: 'bottle_7', size: 10, currentLevel: 10 }] },
    { id: '8', brand: 'BIBBI', scent: 'Fruit Captain', price: 4.5, category: 'Travel/Sample', season: 'Warm Weather', rotationMonths: 'Jun, Jul', dayEvening: 'Day', specialOccasion: false, topNotes: 'Green Fig, Wild Berries', middleNotes: 'Peach, Cyclamen', baseNotes: 'Amber, Cedarwood', status: 'active', dateBought: today, bottles: [{ id: 'bottle_8', size: 10, currentLevel: 10 }] },
    { id: '9', brand: 'BIBBI', scent: 'Ghost of Tom', price: 4.5, category: 'Travel/Sample', season: 'Cool Weather', rotationMonths: 'Sep, Feb', dayEvening: 'Evening', specialOccasion: false, topNotes: 'Bergamot, Black Tea', middleNotes: 'Juniper, Styrax', baseNotes: 'Birch, Papyrus', status: 'active', dateBought: today, bottles: [{ id: 'bottle_9', size: 10, currentLevel: 10 }] },
    { id: '10', brand: 'Byredo', scent: 'Mojave Ghost', price: 3.8, category: 'Full Bottle (Warm)', season: 'Warm Weather', rotationMonths: 'Apr, May', dayEvening: 'Day', specialOccasion: false, topNotes: 'Ambrette, Nesberry', middleNotes: 'Magnolia, Sandalwood', baseNotes: 'Cedarwood, Musk', status: 'active', dateBought: today, bottles: [{ id: 'bottle_10', size: 50, currentLevel: 50 }] },
    { id: '11', brand: 'Byredo', scent: 'Reunion', price: 3.8, category: 'Full Bottle (Cool)', season: 'Cool Weather', rotationMonths: 'Oct, Nov', dayEvening: 'Day/Evening', specialOccasion: false, topNotes: 'Pink Pepper, Violet', middleNotes: 'Orris, Peony', baseNotes: 'Amber, Cedarwood', status: 'active', dateBought: today, bottles: [{ id: 'bottle_11', size: 100, currentLevel: 100 }] },
    { id: '12', brand: 'CRA-YON', scent: 'Sand Service', price: 1.3, category: 'Full Bottle (Cool)', season: 'Cool Weather', rotationMonths: 'Sep, Oct', dayEvening: 'Day/Evening', specialOccasion: false, topNotes: 'Violet Leaf, Cardamom', middleNotes: 'Orris, Papyrus', baseNotes: 'Amber, Leather', status: 'active', dateBought: today, bottles: [{ id: 'bottle_12', size: 50, currentLevel: 50 }] },
    { id: '13', brand: 'Discover (M&S)', scent: 'Black Pepper', price: 0.42, category: 'Full Bottle (Cool)', season: 'Cool Weather', rotationMonths: 'Oct, Nov', dayEvening: 'Day/Evening', specialOccasion: false, topNotes: 'Black Pepper, Cinnamon', middleNotes: 'Vanillin, Amber', baseNotes: 'Patchouli, Musk', status: 'active', dateBought: today, bottles: [{ id: 'bottle_13', size: 30, currentLevel: 30 }] },
    { id: '14', brand: 'Discover (M&S)', scent: 'Fresh Bergamot', price: 0.42, category: 'Full Bottle (Warm)', season: 'Warm Weather', rotationMonths: 'Jun, Jul', dayEvening: 'Day', specialOccasion: false, topNotes: 'Bergamot, Lemon', middleNotes: 'Jasmine, Clary Sage', baseNotes: 'Sandalwood, Musk', status: 'active', dateBought: today, bottles: [{ id: 'bottle_14', size: 30, currentLevel: 30 }] },
    { id: '15', brand: 'Discover (M&S)', scent: 'Grapefruit & Lotus', price: 0.33, category: 'Full Bottle (Warm)', season: 'Warm Weather', rotationMonths: 'Jul, Aug', dayEvening: 'Day', specialOccasion: false, topNotes: 'Grapefruit, Fig', middleNotes: 'Lotus, Rose', baseNotes: 'Sandalwood, Amber', status: 'active', dateBought: today, bottles: [{ id: 'bottle_15', size: 100, currentLevel: 100 }] },
    { id: '16', brand: 'Discover (M&S)', scent: 'Pink Pepper', price: 0.42, category: 'Full Bottle (Warm)', season: 'Warm Weather', rotationMonths: 'May, Sep', dayEvening: 'Day', specialOccasion: false, topNotes: 'Pink Pepper, Sparkling Lemon', middleNotes: 'Jasmine, Rose', baseNotes: 'Musk, Cedarwood', status: 'active', dateBought: today, bottles: [{ id: 'bottle_16', size: 30, currentLevel: 30 }] },
    { id: '17', brand: 'Discover (M&S)', scent: 'Seasalt & Freesia', price: 0.33, category: 'Full Bottle (Warm)', season: 'Warm Weather', rotationMonths: 'Jul, Aug', dayEvening: 'Day', specialOccasion: false, topNotes: 'Freesia, Green Pear', middleNotes: 'Salt Accord, Lily of the Valley', baseNotes: 'Musk, Amber', status: 'active', dateBought: today, bottles: [{ id: 'bottle_17', size: 100, currentLevel: 100 }] },
    { id: '18', brand: 'Discover (M&S)', scent: 'Soft Bergamot & Musk', price: 0.42, category: 'Full Bottle (Warm)', season: 'Warm Weather', rotationMonths: 'May, Jun', dayEvening: 'Day', specialOccasion: false, topNotes: 'Bergamot, Melon', middleNotes: 'Jasmine, Neroli', baseNotes: 'Vetiver, Musk', status: 'active', dateBought: today, bottles: [{ id: 'bottle_18', size: 30, currentLevel: 30 }] },
    { id: '19', brand: 'Discover (M&S)', scent: 'Soft Iris', price: 0.42, category: 'Full Bottle (Cool)', season: 'Cool Weather', rotationMonths: 'Sep, Oct', dayEvening: 'Day', specialOccasion: false, topNotes: 'Bergamot, Pink Pepper', middleNotes: 'Iris, Jasmine, Violet', baseNotes: 'Patchouli, Vetiver', status: 'active', dateBought: today, bottles: [{ id: 'bottle_19', size: 30, currentLevel: 30 }] },
    { id: '20', brand: 'Discover (M&S)', scent: 'Spiced Bergamot', price: 0.42, category: 'Full Bottle (Cool)', season: 'Cool Weather', rotationMonths: 'Oct, Nov', dayEvening: 'Day/Evening', specialOccasion: false, topNotes: 'Bergamot, Orange', middleNotes: 'Clove, Nutmeg', baseNotes: 'Cedarwood, Amber', status: 'active', dateBought: today, bottles: [{ id: 'bottle_20', size: 30, currentLevel: 30 }] },
    { id: '21', brand: 'Discover (M&S)', scent: 'Summer Blooms', price: 0.33, category: 'Full Bottle (Warm)', season: 'Warm Weather', rotationMonths: 'Jun, Jul', dayEvening: 'Day', specialOccasion: false, topNotes: 'Freesia, Bergamot', middleNotes: 'Orange Blossom, Peony', baseNotes: 'Musk, Amber', status: 'active', dateBought: today, bottles: [{ id: 'bottle_21', size: 100, currentLevel: 100 }] },
    { id: '22', brand: 'Discover (M&S)', scent: 'Sunrise', price: 0.42, category: 'Full Bottle (Warm)', season: 'Warm Weather', rotationMonths: 'Jun, Jul', dayEvening: 'Day', specialOccasion: false, topNotes: 'Bergamot, Mandarin', middleNotes: 'Jasmine, Rose, Neroli', baseNotes: 'Musk, Cedarwood', status: 'active', dateBought: today, bottles: [{ id: 'bottle_22', size: 30, currentLevel: 30 }] },
    { id: '23', brand: 'Discover (M&S)', scent: 'White Coconut', price: 0.25, category: 'Full Bottle (Warm)', season: 'Warm Weather', rotationMonths: 'Jul, Aug', dayEvening: 'Day', specialOccasion: false, topNotes: 'Coconut Water, Frangipani', middleNotes: 'Orange Blossom', baseNotes: 'Vanilla, Musk', status: 'active', dateBought: today, bottles: [{ id: 'bottle_23', size: 30, currentLevel: 30 }] },
    { id: '24', brand: 'Discover Intense (M&S)', scent: 'Orange Blossom & Amber', price: 0.42, category: 'Full Bottle (Cool)', season: 'Cool Weather', rotationMonths: 'Sep, Oct', dayEvening: 'Evening', specialOccasion: false, topNotes: 'Orange Blossom', middleNotes: 'Jasmine, Ylang-Ylang', baseNotes: 'Amber', status: 'active', dateBought: today, bottles: [{ id: 'bottle_24', size: 30, currentLevel: 30 }] },
    { id: '25', brand: 'DS & Durga', scent: 'I Don\'t Know What', price: 2.08, category: 'Full Bottle (Warm)', season: 'All-Year', rotationMonths: 'All Year', dayEvening: 'Day/Evening', specialOccasion: false, topNotes: 'Bergamot Essence', middleNotes: 'Iso E Super, Vetiver Acetate', baseNotes: 'Civettone, Firsantol', status: 'active', dateBought: today, bottles: [{ id: 'bottle_25', size: 100, currentLevel: 100 }] },
    { id: '26', brand: 'Escentric Molecules', scent: 'Escentric 04', price: 1.1, category: 'Travel/Sample', season: 'Warm Weather', rotationMonths: 'May, Jun', dayEvening: 'Day', specialOccasion: false, topNotes: 'Pink Grapefruit, Marijuana', middleNotes: 'Juniper, Rose, Orris', baseNotes: 'Javanol, Mastic', status: 'active', dateBought: today, bottles: [{ id: 'bottle_26', size: 10, currentLevel: 10 }] },
    { id: '27', brand: 'Escentric Molecules', scent: 'Molecule 01 + Black Tea', price: 1.27, category: 'Travel/Sample', season: 'Cool Weather', rotationMonths: 'Sep, Oct', dayEvening: 'Day', specialOccasion: false, topNotes: 'Black Tea', middleNotes: 'Iso E Super', baseNotes: 'Not Applicable', status: 'active', dateBought: today, bottles: [{ id: 'bottle_27', size: 10, currentLevel: 10 }] },
    { id: '28', brand: 'Escentric Molecules', scent: 'Molecule 01 + Ginger', price: 1.27, category: 'Travel/Sample', season: 'Warm Weather', rotationMonths: 'Apr, May', dayEvening: 'Day', specialOccasion: false, topNotes: 'Ginger', middleNotes: 'Iso E Super', baseNotes: 'Not Applicable', status: 'active', dateBought: today, bottles: [{ id: 'bottle_28', size: 10, currentLevel: 10 }] },
    { id: '29', brand: 'Ex Nihilo', scent: 'Fleur Narcotique', price: 3.5, category: 'Travel/Sample', season: 'Warm Weather', rotationMonths: 'May, Jun', dayEvening: 'Day/Evening', specialOccasion: true, topNotes: 'Bergamot, Lychee, Peach', middleNotes: 'Peony, Orange Blossom', baseNotes: 'Musk, Moss', status: 'active', dateBought: today, bottles: [{ id: 'bottle_29', size: 7.5, currentLevel: 7.5 }] },
    { id: '30', brand: 'Floral Street', scent: 'Arizona Bloom', price: 1.28, category: 'Travel/Sample', season: 'Warm Weather', rotationMonths: 'Jul, Aug', dayEvening: 'Day', specialOccasion: false, topNotes: 'Coconut, Black Pepper', middleNotes: 'Jasmine Petals, Fig Leaves', baseNotes: 'Oakmoss, Salted Musks', status: 'active', dateBought: today, bottles: [{ id: 'bottle_30', size: 10, currentLevel: 10 }] },
    { id: '31', brand: 'Floral Street', scent: 'electric rhubarb', price: 1.28, category: 'Full Bottle (Warm)', season: 'Warm Weather', rotationMonths: 'Jun, Jul', dayEvening: 'Day', specialOccasion: false, topNotes: 'Rhubarb, Bergamot', middleNotes: 'Gardenia, Frangipani', baseNotes: 'Sandalwood, Sea Salt', status: 'active', dateBought: today, bottles: [{ id: 'bottle_31', size: 50, currentLevel: 50 }] },
    { id: '32', brand: 'Granado', scent: 'Boemia', price: 0.7, category: 'Travel/Sample', season: 'Cool Weather', rotationMonths: 'Oct, Nov', dayEvening: 'Evening', specialOccasion: false, topNotes: 'Black Pepper, Nutmeg', middleNotes: 'Geranium, Cedar, Olibanum', baseNotes: 'Sandalwood, Leather', status: 'active', dateBought: today, bottles: [{ id: 'bottle_32', size: 10, currentLevel: 10 }] },
    { id: '33', brand: 'Granado', scent: 'Jardim Real', price: 0.7, category: 'Travel/Sample', season: 'Warm Weather', rotationMonths: 'May, Jun', dayEvening: 'Day', specialOccasion: false, topNotes: 'Bergamot, Mandarin', middleNotes: 'Orange Blossom, Jasmine', baseNotes: 'Musk, Sandalwood', status: 'active', dateBought: today, bottles: [{ id: 'bottle_33', size: 10, currentLevel: 10 }] },
    { id: '34', brand: 'Jo Malone', scent: 'Orange Marmalade', price: 1.47, category: 'Full Bottle (Warm)', season: 'Warm Weather', rotationMonths: 'May, Jun', dayEvening: 'Day', specialOccasion: false, topNotes: 'Orange Peel', middleNotes: 'Bitter Orange', baseNotes: 'Cashmere Wood', status: 'active', dateBought: today, bottles: [{ id: 'bottle_34', size: 30, currentLevel: 30 }] },
    { id: '35', brand: 'L\'Occitane', scent: 'Néroli & Orchidée', price: 0.87, category: 'Full Bottle (Warm)', season: 'Warm Weather', rotationMonths: 'May, Jun', dayEvening: 'Day', specialOccasion: false, topNotes: 'Orange, Mandarin', middleNotes: 'Neroli, Peach, Fig Milk', baseNotes: 'Orchid, Iris, Musk', status: 'active', dateBought: today, bottles: [{ id: 'bottle_35', size: 75, currentLevel: 75 }] },
    { id: '36', brand: 'L\'Occitane', scent: 'Verveine', price: 0.58, category: 'Full Bottle (Warm)', season: 'Warm Weather', rotationMonths: 'Jul, Aug', dayEvening: 'Day', specialOccasion: false, topNotes: 'Lemon, Orange', middleNotes: 'Verbena, Petitgrain', baseNotes: 'Geranium, Rose', status: 'active', dateBought: today, bottles: [{ id: 'bottle_36', size: 100, currentLevel: 100 }] },
    { id: '37', brand: 'Le Labo', scent: 'Rose 31', price: 4.6, category: 'Travel/Sample', season: 'Cool Weather', rotationMonths: 'Sep, Oct', dayEvening: 'Evening', specialOccasion: true, topNotes: 'Rose, Cumin, Pepper', middleNotes: 'Vetiver, Cedar', baseNotes: 'Oud, Musk, Gaiac wood', status: 'active', dateBought: today, bottles: [{ id: 'bottle_37', size: 10, currentLevel: 10 }] },
    { id: '38', brand: 'LBTY', scent: 'Adelphi Sun', price: 5, category: 'Travel/Sample', season: 'Warm Weather', rotationMonths: 'Jun, Jul', dayEvening: 'Day', specialOccasion: false, topNotes: 'Bergamot, Cardamom', middleNotes: 'Frankincense, Rosemary', baseNotes: 'Oakwood, Vetiver', status: 'active', dateBought: today, bottles: [{ id: 'bottle_38', size: 8, currentLevel: 8 }] },
    { id: '39', brand: 'LBTY', scent: 'Hera Reigns', price: 5, category: 'Travel/Sample', season: 'Warm Weather', rotationMonths: 'Apr, May', dayEvening: 'Day', specialOccasion: false, topNotes: 'Pink Pepper, Bergamot', middleNotes: 'Juniper, Iris Absolute', baseNotes: 'Neroli, Angelica Seed', status: 'active', dateBought: today, bottles: [{ id: 'bottle_39', size: 8, currentLevel: 8 }] },
    { id: '40', brand: 'LBTY', scent: 'Ianthe Oud', price: 5, category: 'Travel/Sample', season: 'Cool Weather', rotationMonths: 'Nov, Dec', dayEvening: 'Evening', specialOccasion: true, topNotes: 'Raspberry, Cardamom', middleNotes: 'Rose, Geranium, Orris', baseNotes: 'Oud, Patchouli', status: 'active', dateBought: today, bottles: [{ id: 'bottle_40', size: 8, currentLevel: 8 }] },
    { id: '41', brand: 'LBTY', scent: 'Liberty Maze', price: 5, category: 'Travel/Sample', season: 'Warm Weather', rotationMonths: 'May, Jun', dayEvening: 'Day/Evening', specialOccasion: false, topNotes: 'Bergamot, Yuzu', middleNotes: 'Ylang Ylang, Neroli', baseNotes: 'Cedarwood, Musk', status: 'active', dateBought: today, bottles: [{ id: 'bottle_41', size: 8, currentLevel: 8 }] },
    { id: '42', brand: 'LBTY', scent: 'Tudor', price: 5, category: 'Travel/Sample', season: 'Cool Weather', rotationMonths: 'Oct, Nov', dayEvening: 'Day/Evening', specialOccasion: true, topNotes: 'Nutmeg, Angelica Seed', middleNotes: 'Rose Absolute, Ambrette Seed', baseNotes: 'Amber, Birch', status: 'active', dateBought: today, bottles: [{ id: 'bottle_42', size: 8, currentLevel: 8 }] },
    { id: '43', brand: 'LBTY', scent: 'Vine Thief', price: 5, category: 'Travel/Sample', season: 'All-Year', rotationMonths: 'Aug, Sep', dayEvening: 'Day/Evening', specialOccasion: false, topNotes: 'Grapevine, Fig, Mandarin', middleNotes: 'Blackcurrant Bud, Jasmine', baseNotes: 'Amber, Cedarwood', status: 'active', dateBought: today, bottles: [{ id: 'bottle_43', size: 8, currentLevel: 8 }] },
    { id: '44', brand: 'LBTY', scent: 'Wild Rosinda', price: 5, category: 'Travel/Sample', season: 'Warm Weather', rotationMonths: 'May, Jun', dayEvening: 'Day', specialOccasion: true, topNotes: 'Rhubarb, Pink Pepper', middleNotes: 'Rose, Clove, Geranium', baseNotes: 'Frankincense, Vetiver', status: 'active', dateBought: today, bottles: [{ id: 'bottle_44', size: 8, currentLevel: 8 }] },
    { id: '45', brand: 'Maison Margiela', scent: 'Beach Walk', price: 2.5, category: 'Travel/Discovery', season: 'Warm Weather', rotationMonths: 'Jul, Aug', dayEvening: 'Day', specialOccasion: false, topNotes: 'Bergamot, Pink Pepper', middleNotes: 'Ylang-Ylang, Coconut Milk', baseNotes: 'Musk, Cedarwood', status: 'active', dateBought: today, bottles: [{ id: 'bottle_45', size: 2, currentLevel: 2 }] },
    { id: '46', brand: 'Maison Margiela', scent: 'Bubble Bath', price: 2.5, category: 'Travel/Discovery', season: 'All-Year', rotationMonths: 'All Year', dayEvening: 'Day', specialOccasion: false, topNotes: 'Soap, Bergamot', middleNotes: 'Lavender, Rose, Jasmine', baseNotes: 'Coconut, White Musk', status: 'active', dateBought: today, bottles: [{ id: 'bottle_46', size: 2, currentLevel: 2 }] },
    { id: '47', brand: 'Maison Margiela', scent: 'By the Fireplace', price: 2.5, category: 'Travel/Discovery', season: 'Cool Weather', rotationMonths: 'Dec, Jan', dayEvening: 'Evening', specialOccasion: false, topNotes: 'Cloves, Pink Pepper', middleNotes: 'Chestnut, Guaiac Wood', baseNotes: 'Vanilla, Peru Balsam', status: 'active', dateBought: today, bottles: [{ id: 'bottle_47', size: 2, currentLevel: 2 }] },
    { id: '48', brand: 'Maison Margiela', scent: 'Jazz Club', price: 2.5, category: 'Travel/Discovery', season: 'Cool Weather', rotationMonths: 'Oct, Nov', dayEvening: 'Evening', specialOccasion: false, topNotes: 'Pink Pepper, Neroli', middleNotes: 'Rum, Vetiver, Clary Sage', baseNotes: 'Tobacco Leaf, Vanilla', status: 'active', dateBought: today, bottles: [{ id: 'bottle_48', size: 2, currentLevel: 2 }] },
    { id: '49', brand: 'Maison Margiela', scent: 'Lazy Sunday Morning', price: 2.5, category: 'Travel/Discovery', season: 'Warm Weather', rotationMonths: 'Apr, May', dayEvening: 'Day', specialOccasion: false, topNotes: 'Aldehydes, Pear', middleNotes: 'Rose, Iris, Orange Blossom', baseNotes: 'White Musk, Ambrette', status: 'active', dateBought: today, bottles: [{ id: 'bottle_49', size: 2, currentLevel: 2 }] },
    { id: '50', brand: 'Malin + Goetz', scent: 'Bergamot', price: 1.83, category: 'Travel/Discovery', season: 'Warm Weather', rotationMonths: 'Jun, Jul', dayEvening: 'Day', specialOccasion: false, topNotes: 'Bergamot, Bell Pepper', middleNotes: 'Ginger, Muguet', baseNotes: 'Musk, Sandalwood', status: 'active', dateBought: today, bottles: [{ id: 'bottle_50', size: 2, currentLevel: 2 }] },
    { id: '51', brand: 'Malin + Goetz', scent: 'Cannabis', price: 1.83, category: 'Travel/Discovery', season: 'Cool Weather', rotationMonths: 'Sep, Oct', dayEvening: 'Day/Evening', specialOccasion: false, topNotes: 'Bergamot, Black Pepper', middleNotes: 'Magnolia', baseNotes: 'Cedarwood, Patchouli', status: 'active', dateBought: today, bottles: [{ id: 'bottle_51', size: 2, currentLevel: 2 }] },
    { id: '52', brand: 'Malin + Goetz', scent: 'Dark Rum', price: 1.83, category: 'Travel/Discovery', season: 'Cool Weather', rotationMonths: 'Nov, Dec', dayEvening: 'Evening', specialOccasion: false, topNotes: 'Bergamot, Plum', middleNotes: 'Rum, Leather', baseNotes: 'Amber, Patchouli', status: 'active', dateBought: today, bottles: [{ id: 'bottle_52', size: 2, currentLevel: 2 }] },
    { id: '53', brand: 'Malin + Goetz', scent: 'Leather', price: 1.83, category: 'Travel/Discovery', season: 'Cool Weather', rotationMonths: 'Oct, Nov', dayEvening: 'Evening', specialOccasion: false, topNotes: 'Lotus Flower, Pepper', middleNotes: 'Muguet, Orchid', baseNotes: 'Leather, Cedarwood', status: 'active', dateBought: today, bottles: [{ id: 'bottle_53', size: 2, currentLevel: 2 }] },
    { id: '54', brand: 'Malin + Goetz', scent: 'Strawberry', price: 1.83, category: 'Travel/Discovery', season: 'Warm Weather', rotationMonths: 'Jun, Jul', dayEvening: 'Day', specialOccasion: false, topNotes: 'Bergamot, Strawberry', middleNotes: 'Jasmine, Green Notes', baseNotes: 'Cedarwood, Oakmoss', status: 'active', dateBought: today, bottles: [{ id: 'bottle_54', size: 2, currentLevel: 2 }] },
    { id: '55', brand: 'Malin + Goetz', scent: 'Vetiver', price: 1.83, category: 'Travel/Discovery', season: 'Cool Weather', rotationMonths: 'Sep, Oct', dayEvening: 'Day', specialOccasion: false, topNotes: 'Bergamot, Cardamom', middleNotes: 'Vetiver, Celery Seed', baseNotes: 'Amber, Guaiacwood', status: 'active', dateBought: today, bottles: [{ id: 'bottle_55', size: 2, currentLevel: 2 }] },
    { id: '56', brand: 'Matiere Premiere', scent: 'Vanilla Powder', price: 2.1, category: 'Full Bottle (Cool)', season: 'Cool Weather', rotationMonths: 'Nov, Dec', dayEvening: 'Evening', specialOccasion: true, topNotes: 'Coconut Powder', middleNotes: 'Palo Santo', baseNotes: 'White Musk, Vanilla', status: 'active', dateBought: today, bottles: [{ id: 'bottle_56', size: 100, currentLevel: 100 }] },
    { id: '57', brand: 'Maya Njie', scent: 'Nordic Cedar', price: 1.9, category: 'Full Bottle (Cool)', season: 'Cool Weather', rotationMonths: 'Sep, Oct', dayEvening: 'Day', specialOccasion: false, topNotes: 'Cardamom, Patchouli', middleNotes: 'Cedarwood', baseNotes: 'Musk, Amber', status: 'active', dateBought: today, bottles: [{ id: 'bottle_57', size: 50, currentLevel: 50 }] },
    { id: '58', brand: 'Nuxe', scent: 'Prodigieux le Parfum', price: 1.16, category: 'Full Bottle (Warm)', season: 'Warm Weather', rotationMonths: 'Jul, Aug', dayEvening: 'Day/Evening', specialOccasion: false, topNotes: 'Orange Blossom, Bergamot', middleNotes: 'Rose, Gardenia, Magnolia', baseNotes: 'Vanilla, Coconut Milk', status: 'active', dateBought: today, bottles: [{ id: 'bottle_58', size: 50, currentLevel: 50 }] },
    { id: '59', brand: 'Penhaligon\'s', scent: 'Artemisia', price: 3.25, category: 'Travel/Discovery', season: 'Warm Weather', rotationMonths: 'Apr, May', dayEvening: 'Day', specialOccasion: false, topNotes: 'Nectarine, Green Foliage', middleNotes: 'Green Apple, Jasmine Tea', baseNotes: 'Oakmoss, Sandalwood', status: 'active', dateBought: today, bottles: [{ id: 'bottle_59', size: 1.5, currentLevel: 1.5 }] },
    { id: '60', brand: 'Penhaligon\'s', scent: 'Blenheim Bouquet', price: 3.25, category: 'Travel/Discovery', season: 'Warm Weather', rotationMonths: 'Jun, Jul', dayEvening: 'Day', specialOccasion: false, topNotes: 'Lemon, Lime, Lavender', middleNotes: '(No middle notes)', baseNotes: 'Pine, Musk', status: 'active', dateBought: today, bottles: [{ id: 'bottle_60', size: 1.5, currentLevel: 1.5 }] },
    { id: '61', brand: 'Penhaligon\'s', scent: 'Bluebell', price: 3.25, category: 'Travel/Discovery', season: 'Warm Weather', rotationMonths: 'Apr, May', dayEvening: 'Day', specialOccasion: false, topNotes: 'Citrus Notes', middleNotes: 'Hyacinth, Lily of the Valley', baseNotes: 'Galbanum, Clove', status: 'active', dateBought: today, bottles: [{ id: 'bottle_61', size: 1.5, currentLevel: 1.5 }] },
    { id: '62', brand: 'Penhaligon\'s', scent: 'Ellenisia', price: 3.25, category: 'Travel/Discovery', season: 'Warm Weather', rotationMonths: 'May, Jun', dayEvening: 'Day', specialOccasion: false, topNotes: 'Mandarin Zest, Violet Leaf', middleNotes: 'Gardenia, Rose, Tuberose', baseNotes: 'Plum, Vanilla', status: 'active', dateBought: today, bottles: [{ id: 'bottle_62', size: 1.5, currentLevel: 1.5 }] },
    { id: '63', brand: 'Penhaligon\'s', scent: 'Endymion', price: 3.25, category: 'Travel/Discovery', season: 'Cool Weather', rotationMonths: 'Oct, Nov', dayEvening: 'Evening', specialOccasion: false, topNotes: 'Bergamot, Mandarin', middleNotes: 'Geranium, Coffee Absolute', baseNotes: 'Nutmeg, Sandalwood', status: 'active', dateBought: today, bottles: [{ id: 'bottle_63', size: 1.5, currentLevel: 1.5 }] },
    { id: '64', brand: 'Penhaligon\'s', scent: 'Lily of the Valley', price: 3.25, category: 'Travel/Discovery', season: 'Warm Weather', rotationMonths: 'Apr, May', dayEvening: 'Day', specialOccasion: false, topNotes: 'Bergamot, Lemon', middleNotes: 'Lily of the Valley, Rose', baseNotes: 'Sandalwood, Oakmoss', status: 'active', dateBought: today, bottles: [{ id: 'bottle_64', size: 1.5, currentLevel: 1.5 }] },
    { id: '65', brand: 'Penhaligon\'s', scent: 'Malabah', price: 3.25, category: 'Travel/Discovery', season: 'Cool Weather', rotationMonths: 'Sep, Oct', dayEvening: 'Day/Evening', specialOccasion: false, topNotes: 'Lemon, Tea, Coriander', middleNotes: 'Ginger, Nutmeg, Rose', baseNotes: 'Amber, Musk', status: 'active', dateBought: today, bottles: [{ id: 'bottle_65', size: 1.5, currentLevel: 1.5 }] },
    { id: '66', brand: 'Penhaligon\'s', scent: 'Opus 1870', price: 3.25, category: 'Travel/Discovery', season: 'Cool Weather', rotationMonths: 'Sep, Oct', dayEvening: 'Day/Evening', specialOccasion: false, topNotes: 'Yuzu, Black Pepper', middleNotes: 'English Rose, Cinnamon', baseNotes: 'Cedarwood, Sandalwood', status: 'active', dateBought: today, bottles: [{ id: 'bottle_66', size: 1.5, currentLevel: 1.5 }] },
    { id: '67', brand: 'Penhaligon\'s', scent: 'Quercus', price: 3.25, category: 'Travel/Discovery', season: 'Warm Weather', rotationMonths: 'Jun, Jul', dayEvening: 'Day', specialOccasion: false, topNotes: 'Lemon, Lime, Mandarin', middleNotes: 'Jasmine, Lily of the Valley', baseNotes: 'Oakmoss, Sandalwood', status: 'active', dateBought: today, bottles: [{ id: 'bottle_67', size: 1.5, currentLevel: 1.5 }] },
    { id: '68', brand: 'Penhaligon\'s', scent: 'Sartorial', price: 3.25, category: 'Travel/Discovery', season: 'Cool Weather', rotationMonths: 'Oct, Nov', dayEvening: 'Day/Evening', specialOccasion: true, topNotes: 'Aldehydes, Violet Leaf', middleNotes: 'Beeswax, Lavender, Leather', baseNotes: 'Patchouli, Oakmoss', status: 'active', dateBought: today, bottles: [{ id: 'bottle_68', size: 1.5, currentLevel: 1.5 }] },
    { id: '69', brand: 'Perfumer H', scent: 'Ink', price: 5.5, category: 'Travel/Sample', season: 'Cool Weather', rotationMonths: 'Oct, Feb', dayEvening: 'Day/Evening', specialOccasion: false, topNotes: 'Black Pepper, Cedarwood', middleNotes: 'Elemi, Vetiver', baseNotes: 'Papyrus, Patchouli', status: 'active', dateBought: today, bottles: [{ id: 'bottle_69', size: 5, currentLevel: 5 }] },
    { id: '70', brand: 'Perfumer H', scent: 'Rain Cloud', price: 6, category: 'Travel/Sample', season: 'Warm Weather', rotationMonths: 'Apr, May', dayEvening: 'Day', specialOccasion: false, topNotes: 'Angelica Seed, Ylang Ylang', middleNotes: 'Orange Flower Absolute', baseNotes: 'Bourbon Vanilla', status: 'active', dateBought: today, bottles: [{ id: 'bottle_70', size: 5, currentLevel: 5 }] },
    { id: '71', brand: 'Sana Jardin', scent: 'Sandalwood Temple', price: 1.96, category: 'Full Bottle (Cool)', season: 'Cool Weather', rotationMonths: 'Sep, Oct', dayEvening: 'Evening', specialOccasion: true, topNotes: 'Bergamot, Neroli', middleNotes: 'Cedarwood, Guaiacwood', baseNotes: 'Sandalwood, Vanilla', status: 'active', dateBought: today, bottles: [{ id: 'bottle_71', size: 50, currentLevel: 50 }] },
    { id: '72', brand: 'Sana Jardin', scent: 'Tiger By Her Side', price: 1.96, category: 'Full Bottle (Cool)', season: 'Cool Weather', rotationMonths: 'Nov, Dec', dayEvening: 'Evening', specialOccasion: true, topNotes: 'Bergamot, Cinnamon', middleNotes: 'Rose Absolute, Benzoin', baseNotes: 'Amber, Vanilla', status: 'active', dateBought: today, bottles: [{ id: 'bottle_72', size: 50, currentLevel: 50 }] },
    { id: '73', brand: 'Shay & Blue', scent: 'English Cherry Blossom', price: 0.85, category: 'Full Bottle (Warm)', season: 'Warm Weather', rotationMonths: 'Apr, May', dayEvening: 'Day', specialOccasion: false, topNotes: 'Bergamot, Green Mandarin', middleNotes: 'Cherry Blossom, Honeysuckle', baseNotes: 'Black Cherries, Iris', status: 'active', dateBought: today, bottles: [{ id: 'bottle_73', size: 100, currentLevel: 100 }] },
    { id: '74', brand: 'Sol De Janeiro', scent: 'Cheirosa 68 Mist', price: 0.24, category: 'Full Bottle (Warm)', season: 'Warm Weather', rotationMonths: 'Jul, Aug', dayEvening: 'Day', specialOccasion: false, topNotes: 'Pink Dragonfruit, Lychee', middleNotes: 'Brazilian Jasmine, Ocean Air', baseNotes: 'Sheer Vanilla, Musk', status: 'active', dateBought: today, bottles: [{ id: 'bottle_74', size: 90, currentLevel: 90 }] },
    { id: '75', brand: 'Thameen', scent: 'Bravi', price: 5, category: 'Full Bottle (Cool)', season: 'Cool Weather', rotationMonths: 'Nov, Dec', dayEvening: 'Evening', specialOccasion: true, topNotes: 'Bergamot, Bitter Orange', middleNotes: 'Tuberose, Honey, Tobacco', baseNotes: 'Orris Root, Sandalwood', status: 'active', dateBought: today, bottles: [{ id: 'bottle_75', size: 50, currentLevel: 50 }] },
    { id: '76', brand: 'Tom Ford', scent: 'Black Orchid', price: 2.3, category: 'Full Bottle (Cool)', season: 'Cool Weather', rotationMonths: 'Dec, Jan', dayEvening: 'Evening', specialOccasion: true, topNotes: 'Black Truffle, Ylang Ylang', middleNotes: 'Black Orchid, Tuberose', baseNotes: 'Patchouli, Incense', status: 'active', dateBought: today, bottles: [{ id: 'bottle_76', size: 50, currentLevel: 50 }] },
    { id: '77', brand: 'Veronique Gabai', scent: 'Noire de Mai', price: 2.88, category: 'Full Bottle (Cool)', season: 'Cool Weather', rotationMonths: 'Oct, Nov', dayEvening: 'Evening', specialOccasion: true, topNotes: 'Bergamot, Mandarin', middleNotes: 'Rose de Mai, Jasmine', baseNotes: 'Amber, Moss, Woods', status: 'active', dateBought: today, bottles: [{ id: 'bottle_77', size: 85, currentLevel: 85 }] },
    { id: '78', brand: 'Vilhelm Parfumerie', scent: 'Darling Nikki', price: 3.17, category: 'Travel/Sample', season: 'Cool Weather', rotationMonths: 'Oct, Nov', dayEvening: 'Evening', specialOccasion: true, topNotes: 'Sicilian Tangerine, Cassis', middleNotes: 'Saffron, Black Lotus', baseNotes: 'Leather, Woodsmoke', status: 'active', dateBought: today, bottles: [{ id: 'bottle_78', size: 10, currentLevel: 10 }] },
    { id: '79', brand: 'Vilhelm Parfumerie', scent: 'Dear Polly', price: 3.5, category: 'Travel/Sample', season: 'Cool Weather', rotationMonths: 'Sep, Oct', dayEvening: 'Day', specialOccasion: false, topNotes: 'Bergamot, Apple', middleNotes: 'Ceylon Black Tea', baseNotes: 'Oakmoss, Musk', status: 'active', dateBought: today, bottles: [{ id: 'bottle_79', size: 10, currentLevel: 10 }] },
    { id: '80', brand: 'Vilhelm Parfumerie', scent: 'Faces of Francis', price: 4.4, category: 'Travel/Sample', season: 'Cool Weather', rotationMonths: 'Nov, Dec', dayEvening: 'Evening', specialOccasion: true, topNotes: 'Aldehydes, Saffron', middleNotes: 'Grilled Pistachio', baseNotes: 'Oud, Ambergris', status: 'active', dateBought: today, bottles: [{ id: 'bottle_80', size: 10, currentLevel: 10 }] },
    { id: '81', brand: 'Vilhelm Parfumerie', scent: 'Mango Skin', price: 3.5, category: 'Travel/Sample', season: 'Warm Weather', rotationMonths: 'Jul, Aug', dayEvening: 'Day', specialOccasion: false, topNotes: 'Mango, Blackberry', middleNotes: 'Orris, Black Lotus, Jasmine', baseNotes: 'Patchouli, Vanilla', status: 'active', dateBought: today, bottles: [{ id: 'bottle_81', size: 10, currentLevel: 10 }] },
    { id: '82', brand: 'Vilhelm Parfumerie', scent: 'Morning Chess', price: 3.5, category: 'Travel/Sample', season: 'All-Year', rotationMonths: 'Sep, Mar', dayEvening: 'Day', specialOccasion: false, topNotes: 'Bergamot', middleNotes: 'Galbanum, Leather', baseNotes: 'Patchouli, Black Amber', status: 'active', dateBought: today, bottles: [{ id: 'bottle_82', size: 10, currentLevel: 10 }] },
    { id: '83', brand: 'Vilhelm Parfumerie', scent: 'Poets of Berlin', price: 3.5, category: 'Travel/Sample', season: 'Cool Weather', rotationMonths: 'Oct, Nov', dayEvening: 'Day/Evening', specialOccasion: false, topNotes: 'Blueberry, Lemon', middleNotes: 'Vanilla, Green Wild Orris', baseNotes: 'Vanilla, Sandalwood', status: 'active', dateBought: today, bottles: [{ id: 'bottle_83', size: 10, currentLevel: 10 }] },
    { id: '84', brand: 'Vyrao', scent: 'Free 00', price: 2.7, category: 'Full Bottle (Warm)', season: 'Warm Weather', rotationMonths: 'Jun, Jul', dayEvening: 'Day', specialOccasion: false, topNotes: 'Lemon, Mandarin', middleNotes: 'Jasmine, Waterlily', baseNotes: 'Sandalwood, Vanilla', status: 'active', dateBought: today, bottles: [{ id: 'bottle_84', size: 50, currentLevel: 50 }] },
    { id: '85', brand: 'Vyrao', scent: 'I am Verdant', price: 2.7, category: 'Full Bottle (Warm)', season: 'Warm Weather', rotationMonths: 'May, Jun', dayEvening: 'Day', specialOccasion: false, topNotes: 'Bergamot, Cyclamen', middleNotes: 'Frankincense', baseNotes: 'Iris Absolute', status: 'active', dateBought: today, bottles: [{ id: 'bottle_85', size: 50, currentLevel: 50 }] },
    { id: '86', brand: 'Vyrao', scent: 'Witchy Woo', price: 2.7, category: 'Full Bottle (Cool)', season: 'Cool Weather', rotationMonths: 'Oct, Dec', dayEvening: 'Evening', specialOccasion: false, topNotes: 'Moroccan Orris, Rose', middleNotes: 'Nutmeg, Cinnamon', baseNotes: 'Frankincense, Musk', status: 'active', dateBought: today, bottles: [{ id: 'bottle_86', size: 50, currentLevel: 50 }] },
];

// --- MOCK FRAGRANCE API ---
// Simulates fetching details for a new perfume.
const mockFragranceDB = {
    'guerlain': {
        'shalimar': {
            price: 2.5,
            topNotes: 'Citrus, Bergamot, Lemon',
            middleNotes: 'Iris, Jasmine, Rose',
            baseNotes: 'Incense, Vanilla, Tonka Bean',
        }
    },
    'chanel': {
        'no. 5': {
            price: 3.0,
            topNotes: 'Aldehydes, Ylang-Ylang, Neroli',
            middleNotes: 'Iris, Jasmine, Rose, Lily-of-the-Valley',
            baseNotes: 'Sandalwood, Vetiver, Amber, Civet, Musk',
        }
    }
};

const fetchNewPerfumeDetails = (brand, scent) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const brandLower = brand.toLowerCase();
            const scentLower = scent.toLowerCase();
            if (mockFragranceDB[brandLower] && mockFragranceDB[brandLower][scentLower]) {
                resolve(mockFragranceDB[brandLower][scentLower]);
            } else {
                // Return a default structure if not in the mock DB
                resolve({
                    price: 1.5,
                    topNotes: 'Not found',
                    middleNotes: 'Please edit manually',
                    baseNotes: 'Please edit manually',
                });
            }
        }, 1500); // Simulate network delay
    });
};


// --- Helper Components ---
const Icon = ({ path, className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d={path} clipRule="evenodd" />
    </svg>
);

const StarIcon = () => <Icon path="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.116 3.986 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.986c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" className="w-5 h-5 text-yellow-400" />;
const PlusIcon = () => <Icon path="M12 5v14m-7-7h14" className="w-6 h-6 stroke-current" fill="none" strokeWidth="2" />;
const ShelfIcon = () => <Icon path="M3.75 3h16.5v1.5H3.75V3zM3.75 9h16.5v1.5H3.75V9zm0 6h16.5v1.5H3.75v-6z" />;
const BrainIcon = () => <Icon path="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 004.472-.69a.75.75 0 11.584 1.382A10.47 10.47 0 0118 16.5a10.5 10.5 0 01-10.5-10.5 10.47 10.47 0 01.99-4.718a.75.75 0 01.819.162zM10.034 3.44a.75.75 0 01.246.812A7.47 7.47 0 0010.5 6a7.5 7.5 0 007.5 7.5 7.47 7.47 0 002.744-.534a.75.75 0 11.534 1.448A8.97 8.97 0 0118 15a9 9 0 01-9-9 8.97 8.97 0 01.98-4.432a.75.75 0 01.812.246zM12 9.75a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5a.75.75 0 01.75-.75z" />;
const SendIcon = () => <Icon path="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />;
const CloseIcon = () => <Icon path="M6 18L18 6M6 6l12 12" className="w-6 h-6 stroke-current" fill="none" strokeWidth="2" />;
const SearchIcon = () => <Icon path="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" className="w-5 h-5 stroke-current" fill="none" strokeWidth="2" />;
const TrashIcon = () => <Icon path="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" className="w-5 h-5" />;

// --- Main Application Component ---
export default function App() {
    // --- Firebase State ---
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [appId, setAppId] = useState('default-app-id');
    
    // --- App State ---
    const [perfumes, setPerfumes] = useState([]);
    const [view, setView] = useState('shelf');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('brand');
    const [selectedPerfume, setSelectedPerfume] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isNewPerfumeModalOpen, setIsNewPerfumeModalOpen] = useState(false);
    const [aiMessages, setAiMessages] = useState([{ sender: 'ai', text: 'Welcome! I am your Scent Sommelier. Ask me anything about your collection.' }]);
    const [aiInput, setAiInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // --- Firebase Initialization and Auth ---
    useEffect(() => {
        const currentAppId = typeof __app_id !== 'undefined' ? __app_id : 'scent-shelf-app';
        setAppId(currentAppId);

        try {
            const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
            if (Object.keys(firebaseConfig).length > 0) {
                const app = initializeApp(firebaseConfig);
                const firestoreDb = getFirestore(app);
                const firestoreAuth = getAuth(app);
                setDb(firestoreDb);
                setAuth(firestoreAuth);
            } else {
                 console.log("Firebase config not found, using local data.");
                 setPerfumes(initialPerfumes);
            }
        } catch (error) {
            console.error("Error initializing Firebase:", error);
            setPerfumes(initialPerfumes);
        }
    }, []);

    useEffect(() => {
        if (auth) {
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                if (user) {
                    setUserId(user.uid);
                    setIsAuthReady(true);
                } else {
                    try {
                        const token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
                        if (token) {
                            await signInWithCustomToken(auth, token);
                        } else {
                            await signInAnonymously(auth);
                        }
                    } catch (error) {
                        console.error("Authentication error:", error);
                        setIsAuthReady(true);
                    }
                }
            });
            return () => unsubscribe();
        }
    }, [auth]);

    // --- Firestore Data Sync ---
    useEffect(() => {
        if (isAuthReady && db && userId) {
            const perfumesCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'perfumes');
            const unsubscribe = onSnapshot(perfumesCollectionRef, (snapshot) => {
                if (snapshot.empty) {
                    console.log("No perfumes found in Firestore. Populating with initial data...");
                    initialPerfumes.forEach(async (perfume) => {
                        const { id, ...perfumeData } = perfume;
                        await addDoc(perfumesCollectionRef, perfumeData);
                    });
                } else {
                    const perfumesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setPerfumes(perfumesData);
                }
            }, (error) => {
                console.error("Error fetching perfumes from Firestore:", error);
            });
            return () => unsubscribe();
        }
    }, [isAuthReady, db, userId, appId]);

    // --- Handlers ---
    const handleUpdatePerfume = async (perfumeToUpdate) => {
        if (!db || !userId) {
            setPerfumes(perfumes.map(p => p.id === perfumeToUpdate.id ? perfumeToUpdate : p));
            return;
        }
        const { id, ...perfumeData } = perfumeToUpdate;
        const perfumeDocRef = doc(db, 'artifacts', appId, 'users', userId, 'perfumes', id);
        try {
            await updateDoc(perfumeDocRef, perfumeData);
        } catch (error) {
            console.error("Error updating perfume:", error);
        }
    };

    const handleAddPerfume = async (newPerfume) => {
        const perfumeWithDefaults = {
            ...newPerfume,
            category: 'Full Bottle (Warm)',
            season: 'Warm Weather',
            rotationMonths: 'Jun, Jul',
            dayEvening: 'Day',
            specialOccasion: false,
            status: 'active',
        };
        if (!db || !userId) {
            setPerfumes([...perfumes, { ...perfumeWithDefaults, id: Date.now().toString() }]);
            return;
        }
        try {
            const perfumesCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'perfumes');
            await addDoc(perfumesCollectionRef, perfumeWithDefaults);
        } catch (error) {
            console.error("Error adding new perfume:", error);
        }
    };
    
    const handleMarkAsEmpty = async (perfume) => {
        await handleUpdatePerfume({ ...perfume, status: 'empty', bottles: [] });
        setIsModalOpen(false);
    };

    const handleAiQuery = async () => {
        if (!aiInput.trim()) return;
        const newMessages = [...aiMessages, { sender: 'user', text: aiInput }];
        setAiMessages(newMessages);
        setAiInput('');
        setIsLoading(true);

        const context = `You are a "Scent Sommelier", a world-class fragrance expert. The user's current perfume collection is provided below as a JSON object. Your task is to answer the user's question based *only* on the data in their collection and your general fragrance knowledge. Be friendly, insightful, and concise.
        User's Collection: ${JSON.stringify(perfumes.filter(p => p.status === 'active'))}
        User's Question: "${aiInput}"
        Your Answer:`;

        try {
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const payload = { contents: [{ role: "user", parts: [{ text: context }] }] };
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
            const result = await response.json();
            let aiResponse = "Sorry, I couldn't generate a response right now.";
            if (result.candidates && result.candidates[0] && result.candidates[0].content.parts[0]) {
               aiResponse = result.candidates[0].content.parts[0].text;
            }
            setAiMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
        } catch (error) {
            console.error("AI API Error:", error);
            setAiMessages(prev => [...prev, { sender: 'ai', text: "I'm having trouble connecting to my knowledge base. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Filtering and Sorting Logic ---
    const activePerfumes = perfumes.filter(p => p.status === 'active');
    
    const currentMonthName = new Date().toLocaleString('default', { month: 'short' });
    const rotationSuggestions = activePerfumes.filter(p => p.rotationMonths.toLowerCase().includes(currentMonthName.toLowerCase()));

    const sortedAndFilteredPerfumes = activePerfumes
        .filter(p =>
            p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.scent.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            switch (sortBy) {
                case 'brand':
                    return a.brand.localeCompare(b.brand);
                case 'scent':
                    return a.scent.localeCompare(b.scent);
                case 'season':
                    return a.season.localeCompare(b.season);
                case 'price_asc':
                    return a.price - b.price;
                case 'price_desc':
                    return b.price - a.price;
                case 'date_asc':
                    return new Date(a.dateBought) - new Date(b.dateBought);
                case 'date_desc':
                    return new Date(b.dateBought) - new Date(a.dateBought);
                default:
                    return 0;
            }
        });

    return (
        <div className="bg-gray-100 font-sans text-gray-800 min-h-screen flex">
            <nav className="w-64 bg-white border-r border-gray-200 p-6 flex-shrink-0 flex flex-col">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Scent Shelf</h1>
                <ul className="space-y-2">
                    <li><button onClick={() => setView('shelf')} className={`flex items-center space-x-3 w-full text-left p-2 rounded-lg ${view === 'shelf' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-100'}`}><ShelfIcon /><span>My Shelf</span></button></li>
                    <li><button onClick={() => setIsNewPerfumeModalOpen(true)} className="flex items-center space-x-3 w-full text-left p-2 rounded-lg hover:bg-gray-100"><PlusIcon /><span>Add Perfume</span></button></li>
                    <li><button onClick={() => setView('ai')} className={`flex items-center space-x-3 w-full text-left p-2 rounded-lg ${view === 'ai' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-100'}`}><BrainIcon /><span>AI Advisor</span></button></li>
                </ul>
                <div className="mt-auto text-sm text-gray-500">
                    <p>{activePerfumes.length} perfumes on shelf</p>
                    <p>{perfumes.filter(p => p.status === 'empty').length} empty bottles</p>
                    <p className="mt-2 text-xs truncate">User ID: {userId || 'local'}</p>
                </div>
            </nav>

            <main className="flex-1 p-8 overflow-y-auto">
                {view === 'shelf' && (
                    <ShelfView
                        perfumes={sortedAndFilteredPerfumes}
                        suggestions={rotationSuggestions}
                        onSelectPerfume={(p) => { setSelectedPerfume(p); setIsModalOpen(true); }}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                    />
                )}
                {view === 'ai' && (
                    <AiView
                        messages={aiMessages}
                        input={aiInput}
                        setInput={setAiInput}
                        onQuery={handleAiQuery}
                        isLoading={isLoading}
                    />
                )}
            </main>

            {isModalOpen && selectedPerfume && (
                <EditModal
                    perfume={selectedPerfume}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleUpdatePerfume}
                    onMarkEmpty={handleMarkAsEmpty}
                />
            )}
            {isNewPerfumeModalOpen && (
                <NewPerfumeModal
                    onClose={() => setIsNewPerfumeModalOpen(false)}
                    onAdd={handleAddPerfume}
                />
            )}
        </div>
    );
}

// --- View Components ---
const ShelfView = ({ perfumes, suggestions, onSelectPerfume, searchTerm, setSearchTerm, sortBy, setSortBy }) => {
    const currentMonthName = new Date().toLocaleString('default', { month: 'long' });
    return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">My Shelf</h2>
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search brand or scent..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></div>
                </div>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="py-2 px-4 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                    <option value="brand">Sort by Brand</option>
                    <option value="scent">Sort by Scent</option>
                    <option value="season">Sort by Season</option>
                    <option value="price_asc">Sort by Cost (Low-High)</option>
                    <option value="price_desc">Sort by Cost (High-Low)</option>
                    <option value="date_desc">Sort by Date (Newest)</option>
                    <option value="date_asc">Sort by Date (Oldest)</option>
                </select>
            </div>
        </div>
        
        <div className="mb-10">
            <h3 className="text-xl font-bold mb-3">Active Rotation Suggestions for {currentMonthName}</h3>
            {suggestions.length > 0 ? (
                <div className="flex overflow-x-auto space-x-6 pb-4">
                    {suggestions.map(p => (
                        <div key={p.id} className="flex-shrink-0 w-64">
                             <PerfumeCard perfume={p} onSelect={() => onSelectPerfume(p)} />
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">No specific suggestions for this month. A good time to experiment!</p>
            )}
        </div>
        
        <hr className="mb-10 border-gray-200" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {perfumes.map(p => <PerfumeCard key={p.id} perfume={p} onSelect={() => onSelectPerfume(p)} />)}
        </div>
    </div>
    )
};

const PerfumeCard = ({ perfume, onSelect }) => {
    const totalCurrentLevel = perfume.bottles.reduce((sum, bottle) => sum + bottle.currentLevel, 0);
    const totalSize = perfume.bottles.reduce((sum, bottle) => sum + bottle.size, 0);
    const quantityPercentage = totalSize > 0 ? (totalCurrentLevel / totalSize) * 100 : 0;

    return (
        <div onClick={onSelect} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer p-5 flex flex-col h-full">
            <div className="flex-grow relative">
                {perfume.specialOccasion && <div className="absolute top-0 right-0"><StarIcon /></div>}
                <p className="text-sm text-gray-500">{perfume.brand}</p>
                <h3 className="text-lg font-bold text-gray-900 truncate pr-6">{perfume.scent}</h3>
                <div className="flex items-center space-x-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${perfume.season === 'Warm Weather' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                        {perfume.season}
                    </span>
                    {perfume.bottles.length > 1 && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                            {perfume.bottles.length} bottles
                        </span>
                    )}
                </div>
            </div>
            <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{totalCurrentLevel.toFixed(1)}ml</span>
                    <span>{totalSize.toFixed(1)}ml</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${quantityPercentage}%` }}></div>
                </div>
            </div>
        </div>
    );
};

const AiView = ({ messages, input, setInput, onQuery, isLoading }) => {
    const messagesEndRef = useRef(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="flex flex-col h-full max-w-3xl mx-auto bg-white rounded-xl shadow-md">
            <h2 className="text-2xl font-bold p-6 border-b border-gray-200">AI Scent Sommelier</h2>
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'ai' && <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0"><BrainIcon className="w-5 h-5 text-white" /></div>}
                        <div className={`max-w-md p-3 rounded-xl ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                            <p className="text-sm">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-end gap-2 justify-start">
                        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0"><BrainIcon className="w-5 h-5 text-white" /></div>
                        <div className="max-w-md p-3 rounded-xl bg-gray-200 text-gray-800">
                            <div className="flex items-center space-x-1">
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-0"></span>
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></span>
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-300"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && onQuery()}
                        placeholder="Ask for a recommendation..."
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={isLoading}
                    />
                    <button onClick={onQuery} className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300" disabled={isLoading}>
                        <SendIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Modal Components ---
const ModalWrapper = ({ children, onClose, title }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold">{title}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-800"><CloseIcon /></button>
            </div>
            <div className="p-6 overflow-y-auto">
                {children}
            </div>
        </div>
    </div>
);

const EditModal = ({ perfume, onClose, onSave, onMarkEmpty }) => {
    const [editedPerfume, setEditedPerfume] = useState(perfume);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditedPerfume(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleBottleChange = (bottleId, newLevel) => {
        setEditedPerfume(prev => ({
            ...prev,
            bottles: prev.bottles.map(b => 
                b.id === bottleId ? { ...b, currentLevel: newLevel } : b
            )
        }));
    };

    const addBottle = () => {
        const newBottleSize = parseInt(prompt("Enter size of the new bottle (ml):"), 10);
        if (newBottleSize && !isNaN(newBottleSize) && newBottleSize > 0) {
            const newBottle = {
                id: `bottle_${Date.now()}`,
                size: newBottleSize,
                currentLevel: newBottleSize,
            };
            setEditedPerfume(prev => ({
                ...prev,
                bottles: [...prev.bottles, newBottle]
            }));
        }
    };

    const deleteBottle = (bottleId) => {
        const updatedBottles = editedPerfume.bottles.filter(b => b.id !== bottleId);
        if (updatedBottles.length === 0) {
            onMarkEmpty(perfume);
        } else {
            setEditedPerfume(prev => ({
                ...prev,
                bottles: updatedBottles
            }));
        }
    };

    const handleSave = () => {
        onSave(editedPerfume);
        onClose();
    };

    return (
        <ModalWrapper onClose={onClose} title={`Edit: ${perfume.brand} - ${perfume.scent}`}>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Brand" name="brand" value={editedPerfume.brand} onChange={handleChange} />
                    <InputField label="Scent" name="scent" value={editedPerfume.scent} onChange={handleChange} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Date Bought" name="dateBought" type="date" value={editedPerfume.dateBought} onChange={handleChange} />
                    <InputField label="Category" name="category" value={editedPerfume.category} onChange={handleChange} />
                </div>

                <div className="space-y-3 pt-2">
                    <h4 className="text-md font-medium text-gray-800">Bottles</h4>
                    {editedPerfume.bottles.map((bottle, index) => (
                        <div key={bottle.id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                            <span className="font-semibold text-gray-600">#{index + 1}</span>
                            <div className="flex-grow">
                                <label className="block text-sm font-medium text-gray-700">Level: {bottle.currentLevel}ml / {bottle.size}ml</label>
                                <input type="range" min="0" max={bottle.size} value={bottle.currentLevel} onChange={(e) => handleBottleChange(bottle.id, parseInt(e.target.value, 10))} className="w-full" />
                            </div>
                            <button onClick={() => deleteBottle(bottle.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full"><TrashIcon /></button>
                        </div>
                    ))}
                    <button onClick={addBottle} className="w-full mt-2 px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 hover:border-gray-400">Add Another Bottle</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectField label="Season" name="season" value={editedPerfume.season} onChange={handleChange} options={['Warm Weather', 'Cool Weather', 'All-Year']} />
                    <InputField label="Rotation Months" name="rotationMonths" value={editedPerfume.rotationMonths} onChange={handleChange} />
                    <SelectField label="Day/Evening" name="dayEvening" value={editedPerfume.dayEvening} onChange={handleChange} options={['Day', 'Evening', 'Day/Evening']} />
                     <div className="flex items-center pt-7">
                        <input type="checkbox" id="specialOccasion" name="specialOccasion" checked={editedPerfume.specialOccasion} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                        <label htmlFor="specialOccasion" className="ml-2 block text-sm text-gray-900">Special Occasion</label>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <InputField as="textarea" label="Top Notes" name="topNotes" value={editedPerfume.topNotes} onChange={handleChange} />
                     <InputField as="textarea" label="Middle Notes" name="middleNotes" value={editedPerfume.middleNotes} onChange={handleChange} />
                     <InputField as="textarea" label="Base Notes" name="baseNotes" value={editedPerfume.baseNotes} onChange={handleChange} />
                </div>
            </div>
            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Changes</button>
            </div>
        </ModalWrapper>
    );
};

const NewPerfumeModal = ({ onClose, onAdd }) => {
    const [step, setStep] = useState(1);
    const [brand, setBrand] = useState('');
    const [scent, setScent] = useState('');
    const [details, setDetails] = useState(null);
    const [bottleSize, setBottleSize] = useState(50);
    const [dateBought, setDateBought] = useState(new Date().toISOString().split('T')[0]);
    const [isFetching, setIsFetching] = useState(false);

    const handleFetch = async () => {
        if (!brand || !scent) return;
        setIsFetching(true);
        
        const prompt = `For the perfume '${scent}' by '${brand}', provide the following information in JSON format: estimated price per ml in GBP (as a number), top notes (as a string), middle notes (as a string), and base notes (as a string).`;
        
        try {
            const apiKey = ""; // Leave empty
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const schema = {
                type: "OBJECT",
                properties: {
                    price: { "type": "NUMBER" },
                    topNotes: { "type": "STRING" },
                    middleNotes: { "type": "STRING" },
                    baseNotes: { "type": "STRING" },
                }
            };
            const payload = {
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: schema
                }
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const result = await response.json();
            
            if (result.candidates && result.candidates[0] && result.candidates[0].content.parts[0]) {
               const fetchedDetails = JSON.parse(result.candidates[0].content.parts[0].text);
               setDetails(fetchedDetails);
            } else {
                 throw new Error("Invalid response structure from API.");
            }

        } catch (error) {
            console.error("AI Fetch Error:", error);
            setDetails({
                price: 1.5,
                topNotes: 'Could not fetch.',
                middleNotes: 'Please edit manually.',
                baseNotes: 'Please edit manually.',
            });
        } finally {
            setIsFetching(false);
            setStep(2);
        }
    };

    const handleAddPerfume = () => {
        const newPerfume = {
            brand,
            scent,
            dateBought,
            ...details,
            bottles: [{
                id: `bottle_${Date.now()}`,
                size: bottleSize,
                currentLevel: bottleSize
            }]
        };
        onAdd(newPerfume);
        onClose();
    };

    return (
        <ModalWrapper onClose={onClose} title="Add a New Perfume">
            {step === 1 && (
                <div className="space-y-4">
                    <InputField label="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g., Guerlain" />
                    <InputField label="Scent" value={scent} onChange={(e) => setScent(e.target.value)} placeholder="e.g., Shalimar" />
                    <div className="pt-4 flex justify-end">
                        <button onClick={handleFetch} disabled={isFetching || !brand || !scent} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300">
                            {isFetching ? 'Fetching...' : 'Fetch Details'}
                        </button>
                    </div>
                </div>
            )}
            {step === 2 && details && (
                <div className="space-y-4">
                     <p className="text-sm text-gray-600">Details fetched for <span className="font-bold">{brand} - {scent}</span>. Please confirm and add.</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Bottle Size (ml)" type="number" value={bottleSize} onChange={(e) => setBottleSize(parseInt(e.target.value, 10))} />
                        <InputField label="Date Bought" type="date" value={dateBought} onChange={(e) => setDateBought(e.target.value)} />
                     </div>
                     <InputField as="textarea" label="Top Notes" value={details.topNotes} readOnly />
                     <InputField as="textarea" label="Middle Notes" value={details.middleNotes} readOnly />
                     <InputField as="textarea" label="Base Notes" value={details.baseNotes} readOnly />
                     <div className="pt-4 flex justify-between">
                        <button onClick={() => setStep(1)} className="px-4 py-2 text-gray-700">Back</button>
                        <button onClick={handleAddPerfume} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add to Shelf</button>
                    </div>
                </div>
            )}
        </ModalWrapper>
    );
};

// --- Form Field Components ---
const InputField = ({ label, as = 'input', ...props }) => {
    const Component = as;
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <Component {...props} className={`w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ${props.readOnly ? 'bg-gray-100' : ''}`} />
        </div>
    );
};

const SelectField = ({ label, options, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select {...props} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white">
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);
