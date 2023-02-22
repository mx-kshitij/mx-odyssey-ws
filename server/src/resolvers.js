const { PubSub } = require("graphql-subscriptions");

const pubsub = new PubSub();

const resolvers = {
  Query: {
    // returns an array of Tracks that will be used to populate the homepage grid of our web client
    tracksForHome: (_, __, { dataSources }) => {
      return dataSources.trackAPI.getTracksForHome();
    },

    // get a single track by ID, for the track page
    track: (_, { id }, { dataSources }) => {
      return dataSources.trackAPI.getTrack(id);
    },

    // get a single module by ID, for the module detail page
    module: (_, { id }, { dataSources }) => {
      return dataSources.trackAPI.getModule(id);
    },

    numberOfViews: async (_, { id }, { dataSources }) => {
      var track = await dataSources.trackAPI.getTrack(id);
      return track.numberOfViews;
    },
  },
  Track: {
    author: ({ authorId }, _, { dataSources }) => {
      return dataSources.trackAPI.getAuthor(authorId);
    },

    modules: ({ id }, _, { dataSources }) => {
      return dataSources.trackAPI.getTrackModules(id);
    },
  },
  Mutation: {
    // increments a track's numberOfViews property
    incrementTrackViews: async (_, {id}, {dataSources}) => {
      try {
        const track = await dataSources.trackAPI.incrementTrackViews(id);

        const getTrack = () => {
          // console.log(track);
          return track;
        }
        
        try{
          pubsub.publish("NUMBER_INCREMENTED", { 
            track: getTrack()
          })

        }
        catch (err){
          console.log(err)
        }
        
        return {
          code: 200,
          success: true,
          message: `Successfully incremented number of views for track ${id}`,
          track
        };
      } catch (err) {
        return {
          code: err.extensions.response.status,
          success: false,
          message: err.extensions.response.body,
          track: null
        };
      }
    },
  },

  Subscription: {
    track: {
      subscribe: () => pubsub.asyncIterator(['NUMBER_INCREMENTED']),
      resolve: (payload) => {
        return payload.track;
      },
    },
  }
};

module.exports = resolvers;
